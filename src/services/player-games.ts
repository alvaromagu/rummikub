import supabase from '../supabase/client'

export async function getPlayerGames({ playerId }: { playerId: number }) {
  const { data, error } = await supabase
    .from('games')
    .select('id')
    .contains('players', JSON.stringify([{ id: playerId }]))

  if (error != null) {
    return null
  }

  return data
}