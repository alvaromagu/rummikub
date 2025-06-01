import { RealtimeChannel } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { getGame } from '../../services/get-game'
import { listenGame } from '../../services/listen-game'
import { useGameStore } from '../../stores/game'
import { Header } from './header'
import { Actions } from './player-section/actions'
import { Tiles } from './player-section/tiles'
import { TilesHelper } from './player-section/tiles-helper'
import { ResultDialog } from './result-dialog'
import { StartButton } from './start-button'
import { FlatRack } from './flat-rack'
import { useSessionStore } from '../../stores/session'

export function Board({
  id
}: {
  id: number
}) {
  const [, navigate] = useLocation()
  const [loading, setLoading] = useState(true)
  const setGame = useGameStore((store) => store.setGame)
  const playerId = useSessionStore(store => store.player?.id)
  const gameStarted = useGameStore(store => store.game?.started)

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
      setGame({game, playerId})
      changes = listenGame({
        id, cb: game => {
          setGame({game, playerId})
        }
      })
    })().finally(() => setLoading(false))

    return () => {
      apply = false
      changes?.unsubscribe()
    }
  }, [id, navigate, setGame, playerId])

  if (loading || gameStarted == null) {
    return <p>Loading...</p>
  }

  return (
    <>
      <Header />
      <FlatRack />
      {gameStarted !== 'not_started' && (
        <div className='flex flex-col gap-2'>
          <Tiles />
          {gameStarted === 'started' && (
            <>
              <Actions />
              <TilesHelper />
            </>
          )}
        </div>
      )}
      <ResultDialog />
      <StartButton />
    </>
  )
}
