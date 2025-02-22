import { Joker } from '../../../components/joker'
import { useGameStore } from '../../../stores/game'
import { useSessionStore } from '../../../stores/session'
import { cn } from '../../../utils/cn'
import { JOKER } from '../../../utils/constants'
import { tileColorMap } from './constants'

export function Tiles() {
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