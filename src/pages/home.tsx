import { useLocation } from 'wouter'
import { Button } from '../components/button'
import { H1 } from '../components/h1'
import { Input } from '../components/input'
import { UnauthorizedRedirect } from '../components/unauthorized-redirect'
import { useSessionStore } from '../stores/session'
import { createGame } from '../services/create-game'
import { joinGame } from '../services/join-game'

type JoinGameForm = {
  gameCode: string
}

export default function Home () {
  const [, navigate] = useLocation()
  const { player } = useSessionStore()

  if (player == null) {
    return <UnauthorizedRedirect />
  }

  return (
    <div className='flex flex-col gap-2'>
      <H1>Home</H1>
      <Button onClick={async () => {
        const {data, error} = await createGame({
          player
        })
        if (error != null) {
          console.error(error)
          return
        }
        const {id} = data
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
        const { error, id } = await joinGame({
          player,
          gameId: gameCode
        })
        if (error) {
          return
        }
        navigate(`/game/${id}`)
      }}>
        <Input placeholder='Game code' name='gameCode' className='pr-21' type='number' required />
        <Button type='submit' className='absolute inset-y-0 right-2 p-0 bg-transparent hover:bg-transparent hover:text-cyan-600'>Join game</Button>
      </form>
    </div>
  )
}