import { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
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
import { useGameStore } from '../stores/game'
import { useSessionStore } from '../stores/session'
import { GameTile, Tile } from '../types/game'
import { cn } from '../utils/cn'
import { JOKER } from '../utils/constants'
import { endTurn } from '../services/end-turn'

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
      <GameBoardRack />
      <div className='flex px-2'>
        <PlayerTiles />
        <PlayerActions />
      </div>
      <GameBoardStart />
    </>
  )
}

function GameBoardRack() {
  const playerId = useSessionStore(store => store.player!.id)
  const rack = useGameStore(store => store.rack)
  const dropTile = useGameStore(store => store.dropTile)

  return (
    <div
      className='flex-1 flex flex-wrap max-h-50 border rounded p-2 gap-4'
      onDrop={event => {
        event.preventDefault()
        const tile = JSON.parse(event.dataTransfer.getData('text/plain')) as GameTile
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
            const tile = JSON.parse(event.dataTransfer.getData('text/plain')) as GameTile
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
  const players = useGameStore((store) => store.game?.players)
  const turnId = useGameStore(store => store.game?.turn_id)

  if (players == null || turnId == null) {
    return null
  }

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
  const playerId = useSessionStore(store => store.player?.id)
  const playerTiles = useGameStore(store => store.game?.players.find(p => p.id === playerId)?.tiles)

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
            event.dataTransfer.setData('text/plain', JSON.stringify([value, color, id]))
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
  const gameId = useGameStore(store => store.game?.id)
  const playerId = useSessionStore(store => store.player?.id)
  const turnId = useGameStore(store => store.game?.turn_id)
  const tilesPool = useGameStore(store => store.game?.tiles_pool.length)

  if (gameId == null || playerId == null || turnId == null || tilesPool == null) {
    return null
  }

  const isPlayerTurn = playerId === turnId

  if (!isPlayerTurn) {
    return null
  }

  const hasModifiedRack = rack.some(tiles => tiles.some(tile => tile[3] === playerId))

  if (hasModifiedRack) {
    return (
      <div className='flex flex-1 gap-2 justify-center items-center'>
        <Button
          className='flex flex-col justify-center items-center gap-2 font-semibold px-1 py-6 h-fit'
          onClick={() => {
            resetRack({ playerId })
          }}
        >
          Reset Rack
        </Button>
        <Button
          className='flex flex-col justify-center items-center gap-2 font-semibold px-1 py-6 h-fit'
          onClick={async () => {
            console.log('submitting rack')
            await endTurn({
              gameId,
              playerId,
              newRack: rack
            })
          }}
        >
          Submit Rack
        </Button>
      </div>
    )
  }
  
  return (
    <div className='flex flex-1 gap-2 justify-center items-center'>
      <Button
        className='flex flex-col justify-center items-center gap-2 font-semibold px-1 py-6 h-fit'
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
  const started = useGameStore(store => store.game?.started)
  const created_by = useGameStore(store => store.game?.created_by)
  const playersLength = useGameStore(store => store.game?.players.length)
  const playerId = useSessionStore(store => store.player?.id)
  const gameId = useGameStore(store => store.game?.id)

  if (started == null || created_by == null || playersLength == null || playerId == null || gameId == null) {
    return null
  }

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
