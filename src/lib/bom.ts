import { ITEM_TYPES } from './catalog'
import type { ItemType, LayoutItem } from '../types'

export interface BomRow {
  type: ItemType
  qty: number
}

/** Quantities per equipment type, in catalog order, from the current scene. */
export function summarizeBom(items: readonly LayoutItem[]): BomRow[] {
  const counts = new Map<ItemType, number>()
  for (const item of items) {
    counts.set(item.type, (counts.get(item.type) ?? 0) + 1)
  }
  return ITEM_TYPES.filter((type) => counts.has(type)).map((type) => ({
    type,
    qty: counts.get(type) ?? 0,
  }))
}
