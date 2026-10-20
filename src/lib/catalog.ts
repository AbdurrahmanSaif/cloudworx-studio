import type { Footprint, ItemType } from '../types'

export interface EquipmentDef {
  footprint: Footprint
  height: number
  color: string
}

/**
 * Footprint dimensions are multiples of 1 m so that boundary clamping
 * (half-widths of 0.5 m) always lands on the 0.5 m grid.
 */
export const EQUIPMENT: Record<ItemType, EquipmentDef> = {
  cabinet: { footprint: { width: 1, depth: 1 }, height: 2, color: '#93a1b5' },
  motor: { footprint: { width: 1, depth: 1 }, height: 1, color: '#518bf0' },
  conveyor: { footprint: { width: 3, depth: 1 }, height: 1.2, color: '#d99a3e' },
}

export const ITEM_TYPES: readonly ItemType[] = ['cabinet', 'motor', 'conveyor']
