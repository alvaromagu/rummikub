import toast from 'react-hot-toast'
import { Button } from '../../components/button'
import { startGame } from '../../services/start-game'
import { useGameStore } from '../../stores/game'
import { useSessionStore } from '../../stores/session'

export function StartButton() {
  const started = useGameStore(store => store.game.started)
  const created_by = useGameStore(store => store.game.created_by)
  const playersLength = useGameStore(store => store.game.players.length)
  const playerId = useSessionStore(store => store.player!.id)
  const gameId = useGameStore(store => store.game.id)

  if (started !== 'not_started' || created_by !== playerId) {
    return null
  }

  return (
    <Button disabled={playersLength < 2} onClick={async () => {
      const res = await startGame({ gameId })
      if (res.error) {
        toast.error(res.message)
      }
    }}>
      Start Game
    </Button>
  )
}
