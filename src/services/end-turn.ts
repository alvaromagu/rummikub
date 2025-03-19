import { RackTile } from '../stores/game'
import supabase from '../supabase/client'
import { ServiceError } from '../types/error'
import { GameTile } from '../types/game'
import { JOKER } from '../utils/constants'
import { getGame } from './get-game'

export async function endTurn({
  gameId,
  playerId,
  newRack
}: {
  gameId: number
  playerId: number
  newRack: RackTile[][]
}): Promise<ServiceError> {
  const game = await getGame({ id: gameId })
  if (game == null) {
    return { error: true, message: 'Game not found' }
  }
  const { id, players, started, turn_id } = game
  if (started !== 'started') {
    return { error: true, message: 'Game is not in started state' }
  }
  if (turn_id !== playerId) {
    return { error: true, message: 'Not your turn' }
  }
  const playerIndex = players.findIndex(p => p.id === playerId)
  if (playerIndex === -1) {
    return { error: true, message: 'Player not found' }
  }
  const player = players[playerIndex]
  const playerTiles = player.tiles
  const rackValidation = validateRack({ oldRack: game.rack_tiles, newRack, playerTiles })
  if (rackValidation.error) {
    return rackValidation
  }
  const rackTiles: GameTile[][] = newRack.map(row => row.map(tile => tile.slice(0, 3) as GameTile))
  const newPlayerTiles: GameTile[] = playerTiles.filter(([,,tileId]) => rackTiles.flat().find(t => t[2] === tileId) == null)
  const hasWon = newPlayerTiles.length === 0
  const { error } = await supabase
    .from('games')
    .update({
      rack_tiles: rackTiles,
      players: players.map(p => p.id === playerId ? { ...p, tiles: newPlayerTiles } : p) as [],
      turn_id: players[(playerIndex + 1) % players.length].id,
      winner_id: hasWon ? playerId : null,
      started: hasWon ? 'finished' : 'started'
    })
    .eq('id', id)
  if (error != null) {
    return { error: true, message: error.message }
  }
  return { error: false }
}

export function validateFlatRack ({
  oldRackTiles,
  newRackTiles,
  playerTiles
}: {
  oldRackTiles: Array<RackTile | undefined>
  newRackTiles: Array<RackTile | undefined>
  playerTiles: GameTile[]
}): ServiceError {
  const placedTiles = newRackTiles.filter(t => t != null).filter(([,,, playerId]) => playerId != null)
  if (placedTiles.length === 0) {
    return { error: true, message: 'No tiles placed' }
  }
  const arePlacedTilesOfPlayer = placedTiles.every(([,,tileId]) => playerTiles.find(t => t[2] === tileId) != null)
  if (!arePlacedTilesOfPlayer) {
    return { error: true, message: 'Placed tiles not of player' }
  }
  // just check length of oldRack is same of newRack - placedTiles
  const oldRackTilesLength = oldRackTiles.length
  const newRackTilesLength = newRackTiles.length
  const placedTilesLength = placedTiles.length
  if (oldRackTilesLength !== newRackTilesLength - placedTilesLength) {
    return { error: true, message: 'Invalid rack length' }
  }
  // check subracks are valid
  const newRackRows = unflatRack({ rackTiles: newRackTiles })
  for (const row of newRackRows) {
    const result = validateRow({row})
    if (result.error) {
      return result
    }
  }
  return { error: false }
}

export function unflatRack ({
  rackTiles
}: {
  rackTiles: Array<RackTile | undefined>
}): RackTile[][] {
  return rackTiles.reduce((rows, tile) => {
    if (tile == null) {
      rows.push([])
      return rows
    }
    rows[rows.length - 1].push(tile)
    return rows
  }, [] as RackTile[][]).filter(row => row.length > 0)
}

function validateRack ({
  oldRack,
  newRack,
  playerTiles
}: {
  oldRack: GameTile[][]
  newRack: RackTile[][]
  playerTiles: GameTile[]
}): ServiceError {
  const oldRackTiles = oldRack.flat()
  const newRackTiles = newRack.flat()
  const placedTiles = newRackTiles.filter(([,,, playerId]) => playerId != null)
  if (placedTiles.length === 0) {
    return { error: true, message: 'No tiles placed' }
  }
  const arePlacedTilesOfPlayer = placedTiles.every(([,,tileId]) => playerTiles.find(t => t[2] === tileId) != null)
  if (!arePlacedTilesOfPlayer) {
    return { error: true, message: 'Placed tiles not of player' }
  }
  // just check length of oldRack is same of newRack - placedTiles
  const oldRackTilesLength = oldRackTiles.length
  const newRackTilesLength = newRackTiles.length
  const placedTilesLength = placedTiles.length
  if (oldRackTilesLength !== newRackTilesLength - placedTilesLength) {
    return { error: true, message: 'Invalid rack length' }
  }
  // check subracks are valid
  for (const row of newRack) {
    const result = validateRow({row})
    if (result.error) {
      return result
    }
  }
  return { error: false }
}

export function validateRow ({
  row
}: {
  row: RackTile[]
}): ServiceError {
  if (row.length <= 2) {
    return { error: true, message: 'Invalid row length' }
  }
  const rowWithoutJokers = row.filter(([value]) => value !== JOKER)
  const isSameNumberRow = rowWithoutJokers.every(([value]) => value === row[0][0])
  if (isSameNumberRow) {
    const colors = new Set([...row.map(([,color]) => color)])
    if (colors.size !== rowWithoutJokers.length) {
      return { error: true, message: 'Can\'t repeat colors' }
    }
    return { error: false }
  }
  // is stair row
  if (rowWithoutJokers.length === 1) {
    return { error: false }
  }
  const allHaveSameColor = rowWithoutJokers.every(([,color]) => color === row[0][1])
  if (!allHaveSameColor) {
    return { error: true, message: 'Colors don\'t match' }
  }
  let checkedFirstNonJoker = false

  for (let i = 0; i < row.length - 1; i++) {
    const [value,] = row[i]
    if (value === JOKER) {
      continue
    }
    if (!checkedFirstNonJoker) {
      checkedFirstNonJoker = true
      continue
    }
    const [prevValue,] = row[i - 1]
    if (prevValue === JOKER) {
      const [secondPrevValue,] = row[i - 2]
      if (secondPrevValue === JOKER) {
        const [thirdPrevValue,] = row[i - 3]
        if (Math.abs(value - thirdPrevValue) !== 3) {
          return { error: true, message: 'Invalid stair' }
        }
      } else if (Math.abs(value - secondPrevValue) !== 2) {
        return { error: true, message: 'Invalid stair' }
      }
    } else if (Math.abs(value - prevValue) !== 1) {
      return { error: true, message: 'Invalid stair' }
    }
  }

  return { error: false }
}
