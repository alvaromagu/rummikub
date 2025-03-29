import { describe, expect, test } from 'vitest'
import { RackTile } from '../src/stores/game'
import { isRackCompact } from '../src/utils/grid'

describe('Rack compact tests', () => {
  test('Leading empty tiles', () => {
    const rackTiles: Array<RackTile | undefined> = [
      undefined,
      undefined,
      [1, 'red', crypto.randomUUID(), 1],
      [2, 'blue', crypto.randomUUID(), 1],
    ]
    expect(isRackCompact({ rackTiles })).toBe(false)
  })

  test('Only one leading empty tile', () => {
    const rackTiles: Array<RackTile | undefined> = [
      undefined,
      [1, 'red', crypto.randomUUID(), 1],
      [2, 'blue', crypto.randomUUID(), 1],
    ]
    expect(isRackCompact({ rackTiles })).toBe(true)
  })

  test('Trailing empty tiles', () => {
    const rackTiles: Array<RackTile | undefined> = [
      [1, 'red', crypto.randomUUID(), 1],
      [2, 'blue', crypto.randomUUID(), 1],
      undefined,
      undefined,
    ]
    expect(isRackCompact({ rackTiles })).toBe(false)
  })

  test('Only one trailing empty tile', () => {
    const rackTiles: Array<RackTile | undefined> = [
      [1, 'red', crypto.randomUUID(), 1],
      [2, 'blue', crypto.randomUUID(), 1],
      undefined,
    ]
    expect(isRackCompact({ rackTiles })).toBe(true)
  })

  test('All tiles are empty', () => {
    const rackTiles: Array<RackTile | undefined> = [
      undefined,
      undefined,
      undefined,
      undefined,
    ]
    expect(isRackCompact({ rackTiles })).toBe(false)
  })

  test('All tiles are filled', () => {
    const rackTiles: Array<RackTile | undefined> = [
      [1, 'red', crypto.randomUUID(), 1],
      [2, 'blue', crypto.randomUUID(), 1],
      [3, 'black', crypto.randomUUID(), 1],
    ]
    expect(isRackCompact({ rackTiles })).toBe(true)
  })
  
  test('Only one tile is between subracks', () => {
    const rackTiles: Array<RackTile | undefined> = [
      [1, 'red', crypto.randomUUID(), 1],
      undefined,
      [2, 'blue', crypto.randomUUID(), 1],
      [3, 'black', crypto.randomUUID(), 1],
    ]
    expect(isRackCompact({ rackTiles })).toBe(true)
  })

  test('Two tiles are between subracks', () => {
    const rackTiles: Array<RackTile | undefined> = [
      [1, 'red', crypto.randomUUID(), 1],
      undefined,
      undefined,
      [2, 'blue', crypto.randomUUID(), 1],
      [3, 'black', crypto.randomUUID(), 1],
    ]
    expect(isRackCompact({ rackTiles })).toBe(true)
  })

  test('Three tiles are between subracks', () => {
    const rackTiles: Array<RackTile | undefined> = [
      [1, 'red', crypto.randomUUID(), 1],
      undefined,
      undefined,
      undefined,
      [2, 'blue', crypto.randomUUID(), 1],
      [3, 'black', crypto.randomUUID(), 1],
    ]
    expect(isRackCompact({ rackTiles })).toBe(false)
  })

  test('Four or more tiles are between subracks', () => {
    const rackTiles: Array<RackTile | undefined> = [
      [1, 'red', crypto.randomUUID(), 1],
      undefined,
      undefined,
      undefined,
      undefined,
      [2, 'blue', crypto.randomUUID(), 1],
      [3, 'black', crypto.randomUUID(), 1],
    ]
    expect(isRackCompact({ rackTiles })).toBe(false)
  })

  test('One empty tile is after a column of the rack', () => {
    const rackTiles: Array<RackTile | undefined> = [
      [1, 'red', crypto.randomUUID(), 1],
      [2, 'blue', crypto.randomUUID(), 1],
      [3, 'black', crypto.randomUUID(), 1],
      [4, 'yellow', crypto.randomUUID(), 1],
      [5, 'red', crypto.randomUUID(), 1],
      [6, 'red', crypto.randomUUID(), 1],
      [7, 'red', crypto.randomUUID(), 1],
      [8, 'red', crypto.randomUUID(), 1],
      [9, 'red', crypto.randomUUID(), 1],
      [10, 'red', crypto.randomUUID(), 1],
      [11, 'red', crypto.randomUUID(), 1],
      [12, 'red', crypto.randomUUID(), 1],
      undefined,
      [13, 'red', crypto.randomUUID(), 1],
      [13, 'blue', crypto.randomUUID(), 1],
    ]
    expect(isRackCompact({ rackTiles })).toBe(true)
  })

  test('Two empty tiles are after a column of the rack', () => {
    const rackTiles: Array<RackTile | undefined> = [
      [1, 'red', crypto.randomUUID(), 1],
      [2, 'blue', crypto.randomUUID(), 1],
      [3, 'black', crypto.randomUUID(), 1],
      [4, 'yellow', crypto.randomUUID(), 1],
      [5, 'red', crypto.randomUUID(), 1],
      [6, 'red', crypto.randomUUID(), 1],
      [7, 'red', crypto.randomUUID(), 1],
      [8, 'red', crypto.randomUUID(), 1],
      [9, 'red', crypto.randomUUID(), 1],
      [10, 'red', crypto.randomUUID(), 1],
      [11, 'red', crypto.randomUUID(), 1],
      [12, 'red', crypto.randomUUID(), 1],
      undefined,
      undefined,
      [13, 'red', crypto.randomUUID(), 1],
    ]
    expect(isRackCompact({ rackTiles })).toBe(false)
  })

  test('Three or more empty tiles are after a column of the rack', () => {
    const rackTiles: Array<RackTile | undefined> = [
      [1, 'red', crypto.randomUUID(), 1],
      [2, 'blue', crypto.randomUUID(), 1],
      [3, 'black', crypto.randomUUID(), 1],
      [4, 'yellow', crypto.randomUUID(), 1],
      [5, 'red', crypto.randomUUID(), 1],
      [6, 'red', crypto.randomUUID(), 1],
      [7, 'red', crypto.randomUUID(), 1],
      [8, 'red', crypto.randomUUID(), 1],
      [9, 'red', crypto.randomUUID(), 1],
      [10, 'red', crypto.randomUUID(), 1],
      [11, 'red', crypto.randomUUID(), 1],
      [12, 'red', crypto.randomUUID(), 1],
      undefined,
      undefined,
      undefined,
      [13, 'red', crypto.randomUUID(), 1],
    ]
    expect(isRackCompact({ rackTiles })).toBe(false)
  })
})