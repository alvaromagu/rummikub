import { RackTile } from '../stores/game'
import supabase from '../supabase/client'
import { ServiceError } from '../types/error'
import { GameTile } from '../types/game'
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
  if (!started) {
    return { error: true, message: 'Game not started' }
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
  const { error } = await supabase
    .from('games')
    .update({
      rack_tiles: rackTiles,
      players: players.map(p => p.id === playerId ? { ...p, tiles: newPlayerTiles } : p) as [],
      turn_id: players[(playerIndex + 1) % players.length].id
    })
    .eq('id', id)
  if (error != null) {
    return { error: true, message: error.message }
  }
  return { error: false }
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
  return { error: false }
}
