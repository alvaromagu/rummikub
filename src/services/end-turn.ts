import { RackTile } from '../stores/game'
import supabase from '../supabase/client'
import { ServiceError } from '../types/error'
import { GameTile } from '../types/game'
import { FIRST_MOVE_SCORE, JOKER, JOKER_FIXED_VALUE } from '../utils/constants'
import { unflatRack } from '../utils/grid'
import { getGame } from './get-game'

export async function endTurn({
  gameId,
  playerId,
  newFlatRack,
  playerTilesState
}: {
  gameId: number
  playerId: number
  newFlatRack: Array<RackTile | undefined>
  playerTilesState: GameTile[]
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
  const flatRackValidation = validateFlatRack({ oldRackTiles: game.flat_rack_tiles, newRackTiles: newFlatRack, playerTiles })
  if (flatRackValidation.error) {
    return flatRackValidation
  }
  if (!player.hasMadeFirstMove) {
    const moveScore = newFlatRack.reduce((acc, tile) => {
      if (tile == null || tile[3] !== playerId) {
        return acc
      }
      const [value] = tile
      return acc + (value === JOKER ? JOKER_FIXED_VALUE : value)
    }, 0)
    if (moveScore < FIRST_MOVE_SCORE) {
      return { error: true, message: 'You need to set at least 30 points' }
    }
  }
  const settedTiles = newFlatRack.filter(tile => tile != null && tile[3] === playerId)
  if (playerTiles.length - settedTiles.length !== playerTilesState.length || playerTilesState.some(tile => {
    const [tileValue, tileColor, tileId] = tile
    return playerTiles.find(pTile => pTile[0] === tileValue && pTile[1] === tileColor && pTile[2] === tileId) == null
  })) {
    return { error: true, message: 'Error, can not modify player tiles' }
  }
  const flatRackTiles: Array<GameTile | undefined> = newFlatRack.map(tile => tile?.slice(0, 3) as unknown as GameTile | undefined)
  const hasWon = playerTilesState.length === 0
  const { error } = await supabase
    .from('games')
    .update({
      players: players.map(p => p.id === playerId ? { ...p, tiles: playerTilesState, hasMadeFirstMove: true } : p) as [],
      turn_id: players[(playerIndex + 1) % players.length].id,
      winner_id: hasWon ? playerId : null,
      started: hasWon ? 'finished' : 'started',
      flat_rack_tiles: flatRackTiles as []
    })
    .eq('id', id)
  if (error != null) {
    return { error: true, message: error.message }
  }
  return { error: false }
}

export function validateFlatRack({
  oldRackTiles,
  newRackTiles,
  playerTiles
}: {
  oldRackTiles: Array<GameTile | undefined>
  newRackTiles: Array<RackTile | undefined>
  playerTiles: GameTile[]
}): ServiceError {
  const newRackTilesWithoutNulls = newRackTiles.filter(t => t != null)
  const oldRackTilesWithoutNulls = oldRackTiles.filter(t => t != null)

  const placedTiles = newRackTilesWithoutNulls.filter(([, , , playerId]) => playerId != null)
  if (placedTiles.length === 0) {
    return { error: true, message: 'No tiles placed' }
  }
  const arePlacedTilesOfPlayer = placedTiles.every(([, , tileId]) => playerTiles.find(t => t[2] === tileId) != null)
  if (!arePlacedTilesOfPlayer) {
    return { error: true, message: 'Placed tiles not of player' }
  }
  // just check length of oldRack is same of newRack - placedTiles
  const oldRackTilesLength = oldRackTilesWithoutNulls.length
  const newRackTilesLength = newRackTilesWithoutNulls.length
  const placedTilesLength = placedTiles.length
  if (oldRackTilesLength !== newRackTilesLength - placedTilesLength) {
    return { error: true, message: 'Invalid rack length' }
  }
  // check subracks are valid
  const newRackRows = unflatRack({ rackTiles: newRackTiles })
  for (const row of newRackRows) {
    const result = validateRow({ row })
    if (result.error) {
      return result
    }
  }
  return { error: false }
}

export function validateRow({
  row
}: {
  row: RackTile[]
}): ServiceError {
  if (row.length <= 2) {
    return { error: true, message: 'Invalid row length' }
  }
  const rowWithoutJokers = row.filter(([value]) => value !== JOKER)
  const isSameNumberRow = rowWithoutJokers.every(([value]) => value === rowWithoutJokers[0][0])
  if (isSameNumberRow) {
    const colors = new Set([...rowWithoutJokers.map(([, color]) => color)])
    if (colors.size !== rowWithoutJokers.length) {
      return { error: true, message: 'Can\'t repeat colors' }
    }
    return { error: false }
  }
  // is stair row
  if (rowWithoutJokers.length === 1) {
    return { error: false }
  }
  const allHaveSameColor = rowWithoutJokers.every(([, color]) => color === rowWithoutJokers[0][1])
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
