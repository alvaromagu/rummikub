import { describe, expect, test } from 'vitest'
import {validateRow} from '../src/services/end-turn'
import { RackTile } from '../src/stores/game'
import { JOKER } from '../src/utils/constants'

// row type for copilot
// export type Tile = [TileValue, 'red' | 'blue' | 'black' | 'yellow']
// export type GameTile = [...Tile, ReturnType<typeof crypto.randomUUID>]
// export type RackTile = [...GameTile, number | undefined]
// row is always a RackTile[]
// crypto.randomUUID() is a function that returns a random string
// example of row
// const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [2, 'blue', crypto.randomUUID(), undefined], [3, 'black', crypto.randomUUID(), undefined]]

test('Validate row with 2 or less tiles returns error', () => {
  let row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [1, 'blue', crypto.randomUUID(), undefined]]
  let result = validateRow({row})
  expect(result.error).toBe(true)
  row = [[1, 'red', crypto.randomUUID(), undefined]]
  result = validateRow({row})
  expect(result.error).toBe(true)
  row = []
  result = validateRow({row})
})

describe('Validate row with all tiles of same number', () => {
  test('Returns error if colors are repeated', () => {
    const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [1, 'red', crypto.randomUUID(), undefined], [1, 'blue', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(true)
  })
  test('Returns no error if colors are not repeated with 3 tiles', () => {
    const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [1, 'blue', crypto.randomUUID(), undefined], [1, 'black', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
  test('Returns no error if colors are not repeated with 4 tiles', () => {
    const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [1, 'blue', crypto.randomUUID(), undefined], [1, 'black', crypto.randomUUID(), undefined], [1, 'yellow', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
  test('Returns no error with one joker in the row', () => {
    const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [1, 'blue', crypto.randomUUID(), undefined], [JOKER, 'red', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
  test('Returns no error with two jokers in the row', () => {
    const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [JOKER, 'red', crypto.randomUUID(), undefined], [JOKER, 'yellow', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
  test('Returns no error with one joker and 4 tiles in the row', () => {
    const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [1, 'blue', crypto.randomUUID(), undefined], [1, 'black', crypto.randomUUID(), undefined], [JOKER, 'red', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
  test('Returns no error with two jokers and 4 tiles in the row', () => {
    const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [1, 'blue', crypto.randomUUID(), undefined], [JOKER, 'red', crypto.randomUUID(), undefined], [JOKER, 'yellow', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
})

describe('Validate row with all tiles of same color', () => {
  test('Returns error if colors don\'t match', () => {
    const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [2, 'red', crypto.randomUUID(), undefined], [3, 'blue', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(true)
  })
  test('Returns no error if colors match', () => {
    const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [2, 'red', crypto.randomUUID(), undefined], [3, 'red', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
  test('Returns no error with one joker in the row', () => {
    const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [2, 'red', crypto.randomUUID(), undefined], [JOKER, 'red', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
  test('Returns no error with two jokers in the row', () => {
    const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [JOKER, 'red', crypto.randomUUID(), undefined], [JOKER, 'red', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
  test('Returns no error with one joker in the middle of the row', () => {
    const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [JOKER, 'red', crypto.randomUUID(), undefined], [3, 'red', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
  test('Returns no error with two jokers in the middle of the row', () => {
    const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [JOKER, 'red', crypto.randomUUID(), undefined], [JOKER, 'yellow', crypto.randomUUID(), undefined], [4, 'red', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
  test('Returns no error with one joker at the start of the row', () => {
    const row: RackTile[] = [[JOKER, 'red', crypto.randomUUID(), undefined], [2, 'red', crypto.randomUUID(), undefined], [3, 'red', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
  test('Returns no error with two jokers at the start of the row', () => {
    const row: RackTile[] = [[JOKER, 'red', crypto.randomUUID(), undefined], [JOKER, 'red', crypto.randomUUID(), undefined], [3, 'red', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
  test('Returns no error with one joker at the end of the row', () => {
    const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [2, 'red', crypto.randomUUID(), undefined], [JOKER, 'red', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
  test('Returns no error with two jokers at the end of the row', () => {
    const row: RackTile[] = [[1, 'red', crypto.randomUUID(), undefined], [2, 'red', crypto.randomUUID(), undefined], [JOKER, 'red', crypto.randomUUID(), undefined], [JOKER, 'red', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
  test('Returns no error with one joker at the start and one at the end of the row', () => {
    const row: RackTile[] = [[JOKER, 'red', crypto.randomUUID(), undefined], [2, 'red', crypto.randomUUID(), undefined], [3, 'red', crypto.randomUUID(), undefined], [JOKER, 'red', crypto.randomUUID(), undefined]]
    const result = validateRow({row})
    expect(result.error).toBe(false)
  })
})

