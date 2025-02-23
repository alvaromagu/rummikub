import { useState } from 'react'
import { Joker } from '../../components/joker'
import { initialColumns, initialRows, RackTile, useGameStore } from '../../stores/game'
import { useSessionStore } from '../../stores/session'
import { cn } from '../../utils/cn'
import { JOKER } from '../../utils/constants'
import { tileColorMap } from './player-section/constants'

export function FlatRack() {
  const playerId = useSessionStore(store => store.player!.id)
  const tiles = useGameStore(store => store.flatRack)
  const dropTile = useGameStore(store => store.dropFlatTile)

  const gridCols = `repeat(${initialColumns}, 1fr)`
  const gridRows = `repeat(${initialRows}, 1fr)`

  return (
    <div
      className='mx-auto border rounded p-2 w-fit gap-0.5'
      style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        gridTemplateRows: gridRows,
      }}
    >
      {tiles.map((tile, index) => (
        <FlatRackTile 
          key={index} 
          tile={tile} 
          index={index} 
          dropTile={({ tile, index}) => {
            dropTile({
              tile,
              index,
              playerId
            })
          }} />
      ))}
    </div>
  )
}

function FlatRackTile({
  tile,
  index,
  dropTile,
}: {
  tile: RackTile | undefined
  index: number
  dropTile: (props: { tile: RackTile; index: number }) => void
}) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div
      key={index}
      onDrop={event => {
        event.preventDefault()
        event.stopPropagation()
        const tile = JSON.parse(event.dataTransfer.getData('text/plain')) as RackTile
        dropTile({ tile, index })
        setIsDragging(false)
      }}
      onDragOver={event => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragging(true)
      }}
      onDragLeave={event => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragging(false)
      }}
    >
      <div
        className={cn(
          'border border-transparent rounded w-8 h-10 font-bold flex justify-center items-center',
          tile != null && `bg-gray-200 ${tileColorMap[tile[1]]}`,
          tile == null && isDragging && 'border-white',
        )}
        draggable
        onDragStart={tile == null ? undefined : event => {
          event.dataTransfer.setData('text/plain', JSON.stringify(tile))
        }}
      >
        {tile == null ? '' : tile[0] === JOKER ? <Joker /> : tile[0]}
      </div>
    </div>
  )
}
