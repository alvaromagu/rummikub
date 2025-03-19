import { describe, expect, test } from 'vitest'
import { unflatRack } from '../src/services/end-turn'
import { RackTile } from '../src/stores/game'

// row type for copilot
// export type Tile = [TileValue, 'red' | 'blue' | 'black' | 'yellow']
// export type GameTile = [...Tile, ReturnType<typeof crypto.randomUUID>]
// export type RackTile = [...GameTile, number | undefined]
// row is always a Array<RackTile | undefined>
// crypto.randomUUID() is a function that returns a random string
// example of row
// const row: Array<RackTile | undefined> = [[1, 'red', crypto.randomUUID(), undefined], [2, 'blue', crypto.randomUUID(), undefined], undefined, [3, 'black', crypto.randomUUID(), undefined]]

describe('Unflat rack', () => {
  test('Unflats rack', () => {
    const id1 = crypto.randomUUID()
    const id2 = crypto.randomUUID()
    const id3 = crypto.randomUUID()
    const id4 = crypto.randomUUID()
    const id5 = crypto.randomUUID()
    const id6 = crypto.randomUUID()
    const id7 = crypto.randomUUID()
    const rackTiles: Array<RackTile | undefined> = [
      undefined,
      [1, 'red', id1, 1], 
      [2, 'blue', id2, 1], 
      [3, 'black', id3, 1], 
      undefined, 
      [4, 'yellow', id4, 1],
      [5, 'red', id5, 1], 
      undefined,
      [6, 'blue', id6, 1], 
      undefined,
      [7, 'black', id7, 1],
      undefined
    ]
    const result = unflatRack({ rackTiles })
    expect(result).toEqual([
      [[1, 'red', id1, 1], [2, 'blue', id2, 1], [3, 'black', id3, 1]],
      [[4, 'yellow', id4, 1], [5, 'red', id5, 1]],
      [[6, 'blue', id6, 1]],
      [[7, 'black', id7, 1]]
    ])
  })
})