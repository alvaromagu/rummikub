import { useRef, useEffect } from 'react'
import { Link } from 'wouter'
import { useGameStore } from '../../stores/game'
import { useSessionStore } from '../../stores/session'
import { cn } from '../../utils/cn'
import Confetti from 'react-confetti'

export function ResultDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const winnerId = useGameStore(store => store.game.winner_id)
  const players = useGameStore(store => store.game.players)
  const started = useGameStore(store => store.game.started)
  const playerId = useSessionStore(store => store.player!.id)

  useEffect(() => {
    const dialogElement = dialogRef.current

    if (started === 'finished') {
      dialogElement?.showModal()
    }

    return () => {
      dialogElement?.close()
    }
  }, [started])

  if (players == null || started == null) {
    return null
  }

  // TODO: CHECK DRAW

  const playersScore = players.map(player => ({ id: player.id, score: player.tiles.reduce((acc, [value]) => acc + value, 0) })).sort((a, b) => a.score - b.score)

  return (
    <dialog ref={dialogRef} className='bg-transparent backdrop:bg-black backdrop:opacity-90 max-w-none max-h-none w-full h-dvh open:grid place-content-center'>
      <div className='bg-black px-10 py-2 rounded border'>
        <header className='mb-5 border-b'>
          <h2 className='text-center text-2xl font-semibold'>
            Game Over
          </h2>
        </header>
        <ul className='flex flex-col gap-2 '>
          {playersScore.map(({ id, score }, index) => (
            <li
              key={id}
              className={cn(
                'bg-zinc-800 rounded px-2 border border-transparent grid grid-cols-[10px_1fr_1fr] gap-4',
                winnerId === id && 'text-yellow-500'
              )}
            >
              <span>{index + 1}</span>
              <span>{players.find(player => player.id === id)?.name}</span>
              <span>{score}</span>
            </li>
          ))}
        </ul>
        <footer className='mt-5 flex justify-center'>
          <Link href='/' className='bg-zinc-800 px-4 py-1 rounded'>
            Back to home
          </Link>
        </footer>
        {playerId === winnerId && <Confetti />}
      </div>
    </dialog>
  )
}