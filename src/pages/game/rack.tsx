import { Joker } from '../../components/joker'
import { useGameStore, RackTile } from '../../stores/game'
import { useSessionStore } from '../../stores/session'
import { cn } from '../../utils/cn'
import { JOKER } from '../../utils/constants'
import { tileColorMap } from './player-section/constants'

export function Rack() {
  const playerId = useSessionStore(store => store.player!.id)
  const rack = useGameStore(store => store.rack)
  const dropTile = useGameStore(store => store.dropTile)

  return (
    <div
      className='flex flex-wrap border rounded p-2 gap-2 min-h-50'
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