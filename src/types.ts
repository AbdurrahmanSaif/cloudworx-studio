export type ItemType = 'cabinet' | 'motor' | 'conveyor'

export interface Vec2 {
  x: number
  z: number
}

export interface Footprint {
  width: number
  depth: number
}

export interface FloorSpec {
  width: number
  depth: number
  cell: number
}

export interface LayoutItem {
  id: string
  type: ItemType
  /** Monotonic per-type sequence number used to derive display names. */
  seq: number
  /** Centre of the item on the ground plane, snapped to the grid. */
  position: Vec2
  /** Rotation around the Y axis in degrees (multiples of 90). */
  rotation: number
}
