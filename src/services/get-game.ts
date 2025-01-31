import supabase from '../supabase/client'
import { Game } from '../types/game'

export async function getGame({ id }: { id: number }) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single()

  if (error != null) {
    return null
  }

  return data as unknown as Game
}