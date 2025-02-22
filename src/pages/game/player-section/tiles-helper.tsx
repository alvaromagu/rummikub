import { Button } from '../../../components/button'
import { useGameStore, tileSorterByValue, tileSorterByColor } from '../../../stores/game'
import { useSessionStore } from '../../../stores/session'

export function TilesHelper() {
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