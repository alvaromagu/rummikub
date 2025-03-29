import { describe, expect, test } from 'vitest'
import { getGridDimensions, initialColumns, initialRows } from '../src/utils/grid'

describe('Grid dimensions', () => {
  test('Test default grid dimensions', () => {
    expect(getGridDimensions({
      length: initialColumns * initialRows
    })).toEqual({
      columns: 12,
      rows: 4
    })
  })

  test('First grid size increase', () => {
    expect(getGridDimensions({
      length: (initialColumns + 3) * (initialRows + 1)
    })).toEqual({
      columns: 15,
      rows: 5
    })
  })

  test('Second grid size increase', () => {
    expect(getGridDimensions({
      length: (initialColumns + 6) * (initialRows + 2)
    })).toEqual({
      columns: 18,
      rows: 6
    })
  })

  const step = Math.floor(Math.random() * 10)
  test(`Random grid size increase: ${step}`, () => {
    expect(getGridDimensions({
      length: (initialColumns + 3 * step) * (initialRows + step)
    })).toEqual({
      columns: 12 + 3 * step,
      rows: 4 + step
    })
  })
})