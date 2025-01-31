import supabase from '../supabase/client'
import { GamePlayer } from '../types/game'
import { Player } from '../types/player'

export async function createGame({ 
  player
}: { 
  player: Player
}) {
  const players: GamePlayer[] = [
    {
      id: player.id,
      name: player.name,
      tiles: []
    }
  ]
  return await supabase
    .from('games')
    .insert([
      {
        created_by: player.id,
        players: players as []
      }
    ])
    .select('id')
    .single()
}