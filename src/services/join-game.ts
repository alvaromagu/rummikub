import supabase from '../supabase/client'
import { GamePlayer } from '../types/game'
import { Player } from '../types/player'
import { MAX_PLAYERS } from '../utils/constants'
import { getGame } from './get-game'

export async function joinGame({
  player,
  gameId
}: {
  player: Player
  gameId: number
}): Promise<{ error: false; id: number } | { error: true; id?: undefined, message: string }> {
  const game = await getGame({ id: gameId })
  if (game == null) {
    return { error: true, message: 'Game not found' }
  }
  const { id, players, started } = game
  const playerAlreadyInGame = players.some(p => p.id === player.id)
  if (playerAlreadyInGame) {
    return { error: false, id }
  }
  if (started !== 'not_started') {
    return { error: true, message: 'Game already started' }
  }
  if (players.length >= MAX_PLAYERS) {
    return { error: true, message: 'Game is full' }
  }
  const newPlayers: GamePlayer[] = [...players, {
    id: player.id,
    name: player.name,
    tiles: [],
    hasMadeFirstMove: false
  }]
  const { error } = await supabase
    .from('games')
    .update({
      players: newPlayers as []
    })
    .eq('id', id)
  if (error != null) {
    return { error: true, message: error.message }
  }
  return { error: false, id }
}