import { useLocation } from 'wouter'
import { Button } from '../components/button'
import { H1 } from '../components/h1'
import { Input } from '../components/input'
import { UnauthorizedRedirect } from '../components/unauthorized-redirect'
import { useSessionStore } from '../stores/session'
import { createGame } from '../services/create-game'
import { joinGame } from '../services/join-game'
import { useEffect, useState } from 'react'
import { getPlayerGames } from '../services/player-games'
import { Link } from '../components/link'
import toast from 'react-hot-toast'

type JoinGameForm = {
  gameCode: string
}

export default function Home() {
  const [, navigate] = useLocation()
  const { player } = useSessionStore()
  const [games, setPlayerGames] = useState<{ id: number }[]>([])

  useEffect(() => {
    if (player?.id == null) {
      return
    }
    (async () => {
      const playerGames = await getPlayerGames({ playerId: player.id })
      setPlayerGames(playerGames ?? [])
    })()
  }, [player?.id])

  if (player == null) {
    return <UnauthorizedRedirect />
  }

  return (
    <div className='flex flex-col gap-2'>
      <H1>Home</H1>
      {games.length > 0 && (
        <ul className='flex flex-col gap-2'>
          {games.map(game => (
            <li key={game.id} className='w-full'>
              <Link href={`/game/${game.id}`} className='px-2 py-1 bg-zinc-900 flex items-center justify-between rounded'>
                <span>Game {game.id}</span>
                <svg xmlns='http://www.w3.org/2000/svg' width={24} height={24} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' className='icon icon-tabler icons-tabler-outline icon-tabler-arrow-right'><path stroke='none' d='M0 0h24v24H0z' fill='none' /><path d='M5 12l14 0' /><path d='M13 18l6 -6' /><path d='M13 6l6 6' /></svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Button onClick={async () => {
        const { data, error } = await createGame({
          player
        })
        if (error != null) {
          toast.error(error.message)
          return
        }
        const { id } = data
        navigate(`/game/${id}`)
      }}>
        Create game
      </Button>
      <form className='relative' onSubmit={async event => {
        event.preventDefault()
        const formObj = Object.fromEntries(new FormData(event.target as HTMLFormElement)) as JoinGameForm
        const gameCode = Math.floor(Number(formObj.gameCode))
        if (isNaN(gameCode)) {
          return
        }
        const res = await joinGame({
          player,
          gameId: gameCode
        })
        if (res.error) {
          toast.error(res.message)
          return
        }
        navigate(`/game/${res.id}`)
      }}>
        <Input placeholder='Game code' name='gameCode' className='pr-21' type='number' required />
        <Button type='submit' className='absolute inset-y-0 right-2 p-0 bg-transparent hover:bg-transparent hover:text-cyan-600'>Join game</Button>
      </form>
    </div>
  )
}