import { useGameStore } from '../../stores/game'
import { cn } from '../../utils/cn'

export function Header() {
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
