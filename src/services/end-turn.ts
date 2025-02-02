import { RackTile } from '../stores/game'
import supabase from '../supabase/client'
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
}): Promise<{ error: boolean; }> {
  const game = await getGame({ id: gameId })
  if (game == null) {
    return { error: true }
  }
  const { id, players, started, turn_id } = game
  if (!started) {
    return { error: true }
  }
  if (turn_id !== playerId) {
    return { error: true }
  }
  const playerIndex = players.findIndex(p => p.id === playerId)
  if (playerIndex === -1) {
    return { error: true }
  }
  const player = players[playerIndex]
  const playerTiles = player.tiles
  const isRackValid = validateRack({ oldRack: game.rack_tiles, newRack, playerTiles })
  console.log({ isRackValid })
  if (!isRackValid) {
    return { error: true }
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
    return { error: true }
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
}): boolean {
  const oldRackTiles = oldRack.flat()
  const newRackTiles = newRack.flat()
  const placedTiles = newRackTiles.filter(([,,, playerId]) => playerId != null)
  if (placedTiles.length === 0) {
    return false
  }
  const arePlacedTilesOfPlayer = placedTiles.every(([,,tileId]) => playerTiles.find(t => t[2] === tileId) != null)
  if (!arePlacedTilesOfPlayer) {
    return false
  }
  // just check length of oldRack is same of newRack - placedTiles
  const oldRackTilesLength = oldRackTiles.length
  const newRackTilesLength = newRackTiles.length
  const placedTilesLength = placedTiles.length
  if (oldRackTilesLength !== newRackTilesLength - placedTilesLength) {
    return false
  }
  return true
}
