import { describe, expect, it } from 'vitest'
import {
  FLOOR,
  clampToFloor,
  isOnGrid,
  resolvePlacement,
  rotatedFootprint,
  snapPosition,
  snapToGrid,
} from './grid'

describe('snapToGrid', () => {
  it('rounds to the nearest 0.5 m', () => {
    expect(snapToGrid(0.24)).toBe(0)
    expect(snapToGrid(0.4)).toBe(0.5)
    expect(snapToGrid(1.3)).toBe(1.5)
    expect(snapToGrid(-0.3)).toBe(-0.5)
    expect(snapToGrid(-0.74)).toBe(-0.5)
  })

  it('keeps values already on the grid', () => {
    expect(snapToGrid(2)).toBe(2)
    expect(snapToGrid(-3.5)).toBe(-3.5)
    expect(snapToGrid(0)).toBe(0)
  })

  it('supports a custom cell size', () => {
    expect(snapToGrid(0.7, 1)).toBe(1)
    expect(snapToGrid(1.4, 0.1)).toBeCloseTo(1.4, 9)
  })
})

describe('snapPosition', () => {
  it('snaps both axes', () => {
    expect(snapPosition({ x: 1.3, z: -0.4 })).toEqual({ x: 1.5, z: -0.5 })
  })
})

describe('clampToFloor', () => {
  const unit = { width: 1, depth: 1 }

  it('leaves positions that fit untouched', () => {
    expect(clampToFloor({ x: 3, z: 2 }, unit)).toEqual({ x: 3, z: 2 })
  })

  it('clamps a position outside the floor to its bounds', () => {
    expect(clampToFloor({ x: 99, z: -99 }, unit)).toEqual({ x: 9.5, z: -5.5 })
    expect(clampToFloor({ x: -99, z: 99 }, unit)).toEqual({ x: -9.5, z: 5.5 })
  })

  it('accounts for the footprint so the item stays fully inside', () => {
    const conveyor = { width: 3, depth: 1 }
    expect(clampToFloor({ x: 9.9, z: 0 }, conveyor)).toEqual({ x: 8.5, z: 0 })
    const rotated = rotatedFootprint(conveyor, 90)
    expect(clampToFloor({ x: 0, z: 5.9 }, rotated)).toEqual({ x: 0, z: 4.5 })
  })

  it('keeps clamped values on the 0.5 m grid', () => {
    const clamped = clampToFloor({ x: 10, z: -6 }, unit)
    expect(isOnGrid(clamped.x)).toBe(true)
    expect(isOnGrid(clamped.z)).toBe(true)
  })
})

describe('rotatedFootprint', () => {
  it('swaps width and depth for odd multiples of 90 degrees', () => {
    const fp = { width: 3, depth: 1 }
    expect(rotatedFootprint(fp, 90)).toEqual({ width: 1, depth: 3 })
    expect(rotatedFootprint(fp, 270)).toEqual({ width: 1, depth: 3 })
    expect(rotatedFootprint(fp, 180)).toEqual(fp)
    expect(rotatedFootprint(fp, 0)).toEqual(fp)
  })
})

describe('resolvePlacement', () => {
  const unit = { width: 1, depth: 1 }

  it('snaps and clamps in one step', () => {
    expect(resolvePlacement({ x: 1.3, z: 2.4 }, unit)).toEqual({
      x: 1.5,
      z: 2.5,
    })
  })

  it('returns a valid on-grid position for wild input', () => {
    const p = resolvePlacement({ x: 123.4, z: -567.8 }, unit)
    expect(p).toEqual({ x: 9.5, z: -5.5 })
    expect(isOnGrid(p.x)).toBe(true)
    expect(isOnGrid(p.z)).toBe(true)
  })

  it('keeps items inside the 20 x 12 floor', () => {
    const p = resolvePlacement({ x: -999, z: 999 }, unit)
    const bounds = { minX: -FLOOR.width / 2, maxZ: FLOOR.depth / 2 }
    expect(p.x).toBeGreaterThanOrEqual(bounds.minX + 0.5)
    expect(p.z).toBeLessThanOrEqual(bounds.maxZ - 0.5)
  })
})

describe('isOnGrid', () => {
  it('detects grid-aligned and off-grid values', () => {
    expect(isOnGrid(2.5)).toBe(true)
    expect(isOnGrid(2.7)).toBe(false)
    expect(isOnGrid(-1.5)).toBe(true)
  })
})
