import { useState } from 'react'
import { Joker } from '../../components/joker'
import { RackTile, useGameStore } from '../../stores/game'
import { useSessionStore } from '../../stores/session'
import { cn } from '../../utils/cn'
import { JOKER } from '../../utils/constants'
import { getGridDimensions } from '../../utils/grid'
import { tileColorMap } from './player-section/constants'

export function FlatRack() {
  const playerId = useSessionStore(store => store.player!.id)
  const flatRackLength = useGameStore(store => store.flatRack.length)
  const tiles = useGameStore(store => store.flatRack)
  const dropTile = useGameStore(store => store.dropFlatTile)
  const { columns, rows } = getGridDimensions({ length: flatRackLength })

  const gridCols = `repeat(${columns}, 1fr)`
  const gridRows = `repeat(${rows}, 1fr)`

  return (
    <div
      className='border rounded p-2 gap-0.5'
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
          dropTile={({ tile, index }) => {
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
          'border border-transparent rounded font-bold flex justify-center items-center aspect-[3/4]',
          tile != null && `bg-gray-200 ${tileColorMap[tile[1]]} cursor-pointer`,
          tile == null && isDragging && 'border-white',
        )}
        draggable={tile != null}
        onDragStart={tile == null ? undefined : event => {
          event.dataTransfer.setData('text/plain', JSON.stringify(tile))
        }}
      >
        {tile == null ? '' : tile[0] === JOKER ? <Joker /> : tile[0]}
      </div>
    </div>
  )
}
