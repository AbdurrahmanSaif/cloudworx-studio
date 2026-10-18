import type { FloorSpec, Footprint, Vec2 } from '../types'

export const FLOOR: FloorSpec = { width: 20, depth: 12, cell: 0.5 }

export function floorBounds(floor: FloorSpec = FLOOR) {
  return {
    minX: -floor.width / 2,
    maxX: floor.width / 2,
    minZ: -floor.depth / 2,
    maxZ: floor.depth / 2,
  }
}

export function snapToGrid(value: number, cell: number = FLOOR.cell): number {
  return Math.round(value / cell) * cell
}

export function snapPosition(position: Vec2, floor: FloorSpec = FLOOR): Vec2 {
  return {
    x: snapToGrid(position.x, floor.cell),
    z: snapToGrid(position.z, floor.cell),
  }
}

export function clampToFloor(
  position: Vec2,
  footprint: Footprint,
  floor: FloorSpec = FLOOR,
): Vec2 {
  const b = floorBounds(floor)
  const halfW = footprint.width / 2
  const halfD = footprint.depth / 2
  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max)
  return {
    x: clamp(position.x, b.minX + halfW, b.maxX - halfW),
    z: clamp(position.z, b.minZ + halfD, b.maxZ - halfD),
  }
}

/** Footprint after rotation by a multiple of 90 degrees. */
export function rotatedFootprint(
  footprint: Footprint,
  rotationDegrees: number,
): Footprint {
  const quarter = Math.round(rotationDegrees / 90)
  return Math.abs(quarter % 2) === 1
    ? { width: footprint.depth, depth: footprint.width }
    : footprint
}

/**
 * Single entry point for every placement: snap to the grid, then clamp the
 * footprint inside the floor. Consistent for add, drag and panel edits.
 */
export function resolvePlacement(
  raw: Vec2,
  footprint: Footprint,
  floor: FloorSpec = FLOOR,
): Vec2 {
  return clampToFloor(snapPosition(raw, floor), footprint, floor)
}

export function isOnGrid(value: number, cell: number = FLOOR.cell): boolean {
  return Math.abs(value / cell - Math.round(value / cell)) < 1e-9
}
