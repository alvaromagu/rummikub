import { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Redirect, useLocation, useParams } from 'wouter'
import { Button } from '../components/button'
import { H1 } from '../components/h1'
import { Joker } from '../components/joker'
import { UnauthorizedRedirect } from '../components/unauthorized-redirect'
import { drawTile } from '../services/draw-tile'
import { getGame } from '../services/get-game'
import { listenGame } from '../services/listen-game'
import { startGame } from '../services/start-game'
import { useGameStore } from '../stores/game'
import { useSessionStore } from '../stores/session'
import { Tile } from '../types/game'
import { cn } from '../utils/cn'
import { JOKER } from '../utils/constants'

export default function Game() {
  const { player } = useSessionStore()
  const { id: pathId } = useParams<{ id: string }>()

  if (player == null) {
    return <UnauthorizedRedirect />
  }

  const id = Math.floor(Number(pathId))

  if (isNaN(id)) {
    return <Redirect to={'/'} />
  }

  return (
    <div className='flex-1 flex flex-col gap-2'>
      <H1 className='text-center'>Game:{id}</H1>
      <GameBoard id={id} />
    </div>
  )
}

function GameBoard({
  id
}: {
  id: number
}) {
  const [, navigate] = useLocation()
  const [loading, setLoading] = useState(true)
  const setGame = useGameStore((store) => store.setGame)

  useEffect(() => {
    setLoading(true)
    let changes: RealtimeChannel
    let apply = true;

    (async () => {
      if (!apply) {
        return
      }
      const game = await getGame({ id })
      if (game == null) {
        navigate('/')
        return
      }
      setGame(game)
      changes = listenGame({ id, cb: setGame })
    })().finally(() => setLoading(false))

    return () => {
      apply = false
      changes?.unsubscribe()
    }
  }, [id, navigate, setGame])

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <GameBoardHeader />
      <PlayerTiles />
      <PlayerActions />
      <GameBoardStart />
    </>
  )
}

function GameBoardHeader() {
  const players = useGameStore((store) => store.game!.players)
  const turnId = useGameStore(store => store.game!.turn_id)

  return (
    <ul className='flex gap-2'>
      {players.map(player => (
        <li className={cn(
          'bg-zinc-800 rounded px-4 border border-transparent transition-colors w-fit flex-1 text-center',
          turnId === player.id && 'border-green-500'
        )} key={player.id}
        >
          {player.name}
        </li>
      ))}
    </ul>
  )
}

const tileColorMap: Record<Tile[1], string> = {
  red: 'text-[#c90000]',
  blue: 'text-[#0051d5]',
  black: 'text-[#2a2a2a]',
  yellow: 'text-[#b78a00]',
}

function PlayerTiles() {
  const playerId = useSessionStore(store => store.player!.id)
  const players = useGameStore(store => store.game!.players)
  const playerTiles = players.find(p => p.id === playerId)!.tiles

  return (
    <ul className='flex flex-wrap gap-0.5 max-w-sm mx-auto'>
      {playerTiles.map(([value, color], index) => (
          <li
          key={`${value}-${color}-${index}`}
          className={
            cn(
              'bg-gray-200 rounded w-[3ch] pt-1 pb-2 font-bold flex justify-center items-center',
              tileColorMap[color],
            )
          }
        >
          {value === JOKER ? <Joker /> : value}
        </li>
      ))}
    </ul>
  )
}

function PlayerActions() {
  const gameId = useGameStore(store => store.game!.id)
  const playerId = useSessionStore(store => store.player!.id)
  const turnId = useGameStore(store => store.game!.turn_id)

  const isPlayerTurn = playerId === turnId

  return (
    <div className='flex gap-2 justify-center'>
      <Button 
        className='w-full max-w-48 flex-2'
        disabled={!isPlayerTurn}
      >
        End Turn
      </Button>
      <Button 
        className='w-full max-w-48' 
        disabled={!isPlayerTurn}
        onClick={async () => {
          await drawTile({ gameId, playerId })
        }}
      >
        Draw Tile
      </Button>
    </div>
  )
}

function GameBoardStart() {
  const started = useGameStore(store => store.game!.started)
  const created_by = useGameStore(store => store.game!.created_by)
  const playersLength = useGameStore(store => store.game!.players.length)
  const playerId = useSessionStore(store => store.player!.id)
  const gameId = useGameStore(store => store.game!.id)

  if (started || created_by !== playerId) {
    return null
  }

  return (
    <Button disabled={playersLength < 2} onClick={async () => {
      await startGame({ gameId })
    }}>
      Start Game
    </Button>
  )
}
