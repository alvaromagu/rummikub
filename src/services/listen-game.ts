import supabase from '../supabase/client'
import { Game } from '../types/game'
import { getGame } from './get-game'

export function listenGame({ id, cb }: { id: number, cb: (game: Game) => void }) {
  return supabase
    .channel('postgresChangesChannel')
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${id}`
    }, async (payload) => {
      const id = payload.old.id
      const game = await getGame({ id })
      if (game == null) {
        return
      }
      cb(game)
    })
    .subscribe()
}