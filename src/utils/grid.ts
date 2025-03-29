import { RackTile } from '../stores/game'

export const initialColumns = 12
export const initialRows = 4
export const initialTiles: Array<RackTile | undefined> = Array.from(
  { length: initialColumns * initialRows },
)

// Initial grid length is initialColumns * initialRows = 12 * 4 = 48
// then the size of the grid gets increase by 3 columns and 1 row
// so next grid length is 15 * 5 = 75
// this function should return the new grid dimensions based on the length 
// of the flat rack and the initial grid dimensions
export function getGridDimensions({ length }: { length: number }): { columns: number, rows: number } {
  let columns = initialColumns
  let rows = initialRows
  let gridSize = columns * rows

  while (gridSize < length) {
    columns += 3
    rows += 1
    gridSize = columns * rows
  }

  return { columns, rows }
}

export function increaseRackSize ({ flatRack }: { flatRack: Array<RackTile | undefined> }): Array<RackTile | undefined> {
  const { columns, rows } = getGridDimensions({ length: flatRack.length })
  const newColumns = columns + 3
  const newFlatRack = Array.from<RackTile | undefined>({ length: (newColumns) * (rows + 1) }).fill(undefined)

  flatRack.forEach((tile, index) => {
    if (tile != null) {
      const oldRow = Math.floor(index / columns)
      const oldColumn = index % columns
      const newIndex = oldRow * newColumns + oldColumn
      newFlatRack[newIndex] = tile
    }
  })

  return newFlatRack
}

export function unflatRack ({
  rackTiles
}: {
  rackTiles: Array<RackTile | undefined>
}): RackTile[][] {
  const { columns } = getGridDimensions({ length: rackTiles.length })
  return rackTiles.reduce((rows, tile, tileIndex) => {
    if (tile == null) {
      rows.push([])
      return rows
    }
    rows[rows.length - 1].push(tile)
    if ((tileIndex + 1) % columns === 0) {
      rows.push([])
    }
    return rows
  }, [[]] as RackTile[][]).filter(row => row.length > 0)
}

export function isRackCompact ({
  rackTiles
}: {
  rackTiles: Array<RackTile | undefined>
}): boolean {
  const firstTileIndex = rackTiles.findIndex(tile => tile != null)
  if (firstTileIndex > 1) {
    return false
  }  
  const lastTileIndex = rackTiles.findLastIndex(tile => tile != null)
  if (lastTileIndex <= rackTiles.length - 3) {
    return false
  }
  const { columns } = getGridDimensions({ length: rackTiles.length })
  return rackTiles.every((tile, index) => {
    if (tile == null) {
      return true
    }
    if (index >= rackTiles.length - 3) {
      return true
    }
    const isColumnIndex = (index + 1) % columns === 0
    const rackIndexes = isColumnIndex ? [index + 1, index + 2] : [index + 1, index + 2, index + 3]
    return rackIndexes.some(index => rackTiles[index] != null)
  })
}