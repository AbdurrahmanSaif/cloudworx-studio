import { describe, expect, it } from 'vitest'
import type { LayoutItem } from '../types'
import {
  PROXIMITY_THRESHOLD_M,
  collectViolationIds,
  findProximityViolations,
} from './rules'

function item(id: string, x: number, z: number, seq = 1): LayoutItem {
  return { id, type: 'cabinet', seq, position: { x, z }, rotation: 0 }
}

describe('findProximityViolations', () => {
  it('returns no violations for an empty scene', () => {
    expect(findProximityViolations([])).toEqual([])
  })

  it('returns no violations for a single item', () => {
    expect(findProximityViolations([item('a', 0, 0)])).toEqual([])
  })

  it('flags two items 0.5 m apart (adjacent grid cells)', () => {
    const a = item('a', 0, 0)
    const b = item('b', 0.5, 0)
    const result = findProximityViolations([a, b])
    expect(result).toHaveLength(1)
    expect(result[0].a).toBe(a)
    expect(result[0].b).toBe(b)
    expect(result[0].distance).toBeCloseTo(0.5, 9)
  })

  it('flags two items sharing the same cell', () => {
    const result = findProximityViolations([item('a', 2, 2), item('b', 2, 2)])
    expect(result).toHaveLength(1)
    expect(result[0].distance).toBe(0)
  })

  it('does not flag items exactly at the threshold distance', () => {
    const result = findProximityViolations([
      item('a', 0, 0),
      item('b', PROXIMITY_THRESHOLD_M, 0),
    ])
    expect(result).toEqual([])
  })

  it('does not flag diagonally adjacent items (0.707 m)', () => {
    const result = findProximityViolations([
      item('a', 0, 0),
      item('b', 0.5, 0.5),
    ])
    expect(result).toEqual([])
  })

  it('only reports the violating pair in a larger scene', () => {
    const items = [
      item('a', 0, 0),
      item('b', 0.5, 0, 2), // close to a
      item('c', 5, 5, 3), // far from both
      item('d', 5.5, 5, 4), // close to c
    ]
    const result = findProximityViolations(items)
    expect(result).toHaveLength(2)
    const pairs = result.map((v) => [v.a.id, v.b.id])
    expect(pairs).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ])
  })

  it('honours a custom threshold', () => {
    const result = findProximityViolations(
      [item('a', 0, 0), item('b', 1, 0)],
      1.5,
    )
    expect(result).toHaveLength(1)
  })
})

describe('collectViolationIds', () => {
  it('collects unique ids of both items in each violation', () => {
    const result = findProximityViolations([
      item('a', 0, 0),
      item('b', 0.5, 0),
      item('c', 0.25, 0, 2), // within 0.5 m of both
    ])
    const ids = collectViolationIds(result)
    expect(ids).toEqual(new Set(['a', 'b', 'c']))
  })

  it('returns an empty set when there are no violations', () => {
    expect(collectViolationIds([])).toEqual(new Set())
  })
})
