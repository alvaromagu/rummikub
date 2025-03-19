import { Button } from '../../../components/button'
import { Card } from '../../../components/card'
import { drawTile } from '../../../services/draw-tile'
import { endTurn } from '../../../services/end-turn'
import { useGameStore } from '../../../stores/game'
import { useSessionStore } from '../../../stores/session'

export function Actions() {
  const rack = useGameStore(store => store.rack)
  const flatRack = useGameStore(store => store.flatRack)
  const resetRack = useGameStore(store => store.resetRack)
  const resetFlatRack = useGameStore(store => store.resetFlatRack)
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
  const hasModifiedFlatRack = flatRack.some(tile => tile != null && tile[3] === playerId)

  if (hasModifiedRack || hasModifiedFlatRack) {
    return (
      <div className='flex justify-center gap-2'>
        <Button
          className='flex font-semibold'
          onClick={() => {
            resetRack({ playerId })
            resetFlatRack({ playerId })
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
              newRack: rack,
              newFlatRack: flatRack
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
