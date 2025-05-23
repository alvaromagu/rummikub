import supabase from '../supabase/client'
import { ServiceError } from '../types/error'
import { GameTile } from '../types/game'
import { randomArrIndex } from '../utils/constants'
import { getGame } from './get-game'

export async function drawTile({
  gameId,
  playerId,
  playerTilesState
}: {
  gameId: number
  playerId: number
  playerTilesState: GameTile[]
}): Promise<ServiceError> {
  const game = await getGame({ id: gameId })
  if (game == null) {
    return { error: true, message: 'Game not found' }
  }
  const { id, players, started, tiles_pool, turn_id } = game
  if (started !== 'started') {
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
  const playerTilesSet = new Set([
    ...playerTilesState.map(([,, id]) => id), 
    ...player.tiles.map(([,, id]) => id)
  ])
  if (playerTilesSet.size !== player.tiles.length) {
    return { error: true, message: 'Error, can not modify player tiles' }
  }
  const [newTile] = tiles_pool.splice(randomArrIndex(tiles_pool.length), 1)
  player.tiles = [...playerTilesState, [...newTile, crypto.randomUUID()]]
  const nextTurnPlayer = players[(playerIndex + 1) % players.length].id
  const {error} = await supabase
    .from('games')
    .update({
      players: players as [],
      tiles_pool,
      turn_id: nextTurnPlayer,
    })
    .eq('id', id)
  if (error != null) {
    return { error: true, message: error.message }
  }
  return { error: false }
}