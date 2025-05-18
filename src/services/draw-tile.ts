import supabase from '../supabase/client'
import { ServiceError } from '../types/error'
import { randomArrIndex } from '../utils/constants'
import { getGame } from './get-game'

export async function drawTile({
  gameId,
  playerId
}: {
  gameId: number
  playerId: number
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
  const [newTile] = tiles_pool.splice(randomArrIndex(tiles_pool.length), 1)
  player.tiles = [...player.tiles, [...newTile, crypto.randomUUID()]]
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