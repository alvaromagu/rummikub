import { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'
import { Redirect, useLocation, useParams } from 'wouter'
import { Button } from '../components/button'
import { Card } from '../components/card'
import { H1 } from '../components/h1'
import { Joker } from '../components/joker'
import { UnauthorizedRedirect } from '../components/unauthorized-redirect'
import { drawTile } from '../services/draw-tile'
import { getGame } from '../services/get-game'
import { listenGame } from '../services/listen-game'
import { startGame } from '../services/start-game'
import { RackTile, tileSorterByColor, tileSorterByValue, useGameStore } from '../stores/game'
import { useSessionStore } from '../stores/session'
import { Tile } from '../types/game'
import { cn } from '../utils/cn'
import { JOKER } from '../utils/constants'
import { endTurn } from '../services/end-turn'
import { Link } from '../components/link'
import Confetti from 'react-confetti'

const tileColorMap: Record<Tile[1], string> = {
  red: 'text-[#c90000]',
  blue: 'text-[#0051d5]',
  black: 'text-[#2a2a2a]',
  yellow: 'text-[#b78a00]',
}

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
  const gameStarted = useGameStore(store => store.game.started)

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

  if (loading || gameStarted == null) {
    return <p>Loading...</p>
  }

  return (
    <>
      <GameBoardHeader />
      <div className='flex min-h-50'>
        <GameBoardRack />
      </div>
      {gameStarted !== 'not_started' && (
        <div className='flex flex-col gap-2'>
          <PlayerTiles />
          {gameStarted === 'started' && (
            <>
              <PlayerActions />
              <TilesHelper />
            </>
          )}
        </div>
      )}
      <WinnerDialog />
      <GameBoardStart />
    </>
  )
}

function WinnerDialog() {
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

function TilesHelper() {
  const sortTiles = useGameStore(store => store.sortTiles)
  const playerId = useSessionStore(store => store.player!.id)

  const sortByValue = () => sortTiles({ playerId, tileSorter: tileSorterByValue })
  const sortByColor = () => sortTiles({ playerId, tileSorter: tileSorterByColor })

  return (
    <div className='flex justify-center gap-2'>
      <Button
        className='flex gap-1 font-semibold'
        onClick={sortByValue}
      >
        777
      </Button>
      <Button
        className='flex gap-1 font-semibold'
        onClick={sortByColor}
      >
        789
      </Button>
    </div>
  )
}

function GameBoardRack() {
  const playerId = useSessionStore(store => store.player!.id)
  const rack = useGameStore(store => store.rack)
  const dropTile = useGameStore(store => store.dropTile)

  return (
    <div
      className='flex flex-wrap flex-1 border rounded p-2 gap-2'
      onDrop={event => {
        event.preventDefault()
        const tile = JSON.parse(event.dataTransfer.getData('text/plain')) as RackTile
        dropTile({
          playerId,
          tile,
        })
      }}
      onDragOver={event => {
        event.preventDefault()
      }}
    >
      {rack.map((tiles, index) => (
        <div
          key={index}
          className='gap-0.5 p-2 border h-fit flex'
          onDrop={event => {
            event.preventDefault()
            event.stopPropagation()
            const tile = JSON.parse(event.dataTransfer.getData('text/plain')) as RackTile
            dropTile({
              playerId,
              tile: tile,
              subrackIndex: index,
            })
          }}
          onDragOver={event => {
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          {tiles.map(([value, color, id]) => (
            <div
              key={id}
              className={cn(
                'bg-gray-200 rounded w-[3ch] pt-1 pb-2 font-bold flex justify-center items-center',
                tileColorMap[color],
              )}
              draggable
              onDragStart={event => {
                event.dataTransfer.setData('text/plain', JSON.stringify([value, color, id]))
              }}
            >
              {value === JOKER ? <Joker /> : value}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function GameBoardHeader() {
  const players = useGameStore((store) => store.game.players)
  const turnId = useGameStore(store => store.game.turn_id)

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

function PlayerTiles() {
  const playerId = useSessionStore(store => store.player!.id)
  const playerTiles = useGameStore(store => store.game.players.find(p => p.id === playerId)?.tiles)

  if (playerTiles == null) {
    return null
  }

  return (
    <ul className='flex flex-wrap gap-0.5 max-w-sm mx-auto'>
      {playerTiles.map(([value, color, id]) => (
        <li
          key={id}
          className={
            cn(
              'bg-gray-200 rounded w-[3ch] pt-1 pb-2 font-bold flex justify-center items-center h-fit',
              tileColorMap[color],
            )
          }
          draggable
          onDragStart={event => {
            event.dataTransfer.setData('text/plain', JSON.stringify([value, color, id, playerId]))
          }}
        >
          {value === JOKER ? <Joker /> : value}
        </li>
      ))}
    </ul>
  )
}

function PlayerActions() {
  const rack = useGameStore(store => store.rack)
  const resetRack = useGameStore(store => store.resetRack)
  const gameId = useGameStore(store => store.game.id)
  const playerId = useSessionStore(store => store.player!.id)
  const turnId = useGameStore(store => store.game.turn_id)
  const tilesPool = useGameStore(store => store.game.tiles_pool.length)

  if (turnId == null) {
    return null
  }

  const isPlayerTurn = playerId === turnId

  if (!isPlayerTurn) {
    return null
  }

  const hasModifiedRack = rack.some(tiles => tiles.some(tile => tile[3] === playerId))

  if (hasModifiedRack) {
    return (
      <div className='flex justify-center gap-2'>
        <Button
          className='flex font-semibold'
          onClick={() => {
            resetRack({ playerId })
          }}
        >
          Reset Rack
        </Button>
        <Button
          className='flex font-semibold'
          onClick={async () => {
            const endTurnResult = await endTurn({
              gameId,
              playerId,
              newRack: rack
            })
            if (endTurnResult.error) {
              console.error(endTurnResult.message)
            }
          }}
        >
          Submit Rack
        </Button>
      </div>
    )
  }

  return (
    <div className='flex justify-center'>
      <Button
        className='flex justify-center items-center gap-2 font-semibold'
        disabled={!isPlayerTurn}
        onClick={async () => {
          await drawTile({ gameId, playerId })
        }}
      >
        Draw Tile
        <span className='text-sm flex items-center'>
          {tilesPool}
          <Card className='size-5' />
        </span>
      </Button>
    </div>
  )
}

function GameBoardStart() {
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
      await startGame({ gameId })
    }}>
      Start Game
    </Button>
  )
}
