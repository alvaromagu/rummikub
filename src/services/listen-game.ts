import supabase from '../supabase/client'
import { Game } from '../types/game'

export function listenGame({ id, cb }: { id: number, cb: (game: Game) => void }) {
  return supabase
    .channel('postgresChangesChannel')
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${id}`
    }, (payload) => {
      const game = payload.new as Game
      cb(game)
    })
    .subscribe()
}