import { describe, expect, it } from 'vitest'
import type { LayoutItem } from '../types'
import { summarizeBom } from './bom'

function item(type: LayoutItem['type'], seq: number): LayoutItem {
  return {
    id: `${type}-${seq}`,
    type,
    seq,
    position: { x: 0, z: 0 },
    rotation: 0,
  }
}

describe('summarizeBom', () => {
  it('returns no rows for an empty scene', () => {
    expect(summarizeBom([])).toEqual([])
  })

  it('counts items per type', () => {
    const items = [
      item('cabinet', 1),
      item('cabinet', 2),
      item('motor', 1),
      item('conveyor', 1),
    ]
    expect(summarizeBom(items)).toEqual([
      { type: 'cabinet', qty: 2 },
      { type: 'motor', qty: 1 },
      { type: 'conveyor', qty: 1 },
    ])
  })

  it('omits types that are not in the scene', () => {
    expect(summarizeBom([item('motor', 1)])).toEqual([
      { type: 'motor', qty: 1 },
    ])
  })

  it('keeps a stable catalog order', () => {
    const items = [item('conveyor', 1), item('cabinet', 1), item('motor', 1)]
    expect(summarizeBom(items).map((r) => r.type)).toEqual([
      'cabinet',
      'motor',
      'conveyor',
    ])
  })
})
