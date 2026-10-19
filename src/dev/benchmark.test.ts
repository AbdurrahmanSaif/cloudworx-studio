import { describe, expect, it } from 'vitest'
import { isOnGrid } from '../lib/grid'
import { generateSeedEntries, round1 } from './benchmark'

describe('generateSeedEntries', () => {
  it('generates exactly the requested count when it fits the floor', () => {
    expect(generateSeedEntries(500)).toHaveLength(500)
    expect(generateSeedEntries(0)).toHaveLength(0)
  })

  it('stops at the floor capacity instead of overflowing', () => {
    // Valid 1 m centres: 39 columns x 23 rows = 897 placements.
    expect(generateSeedEntries(1_000)).toHaveLength(897)
  })

  it('sweeps the floor row by row with on-grid positions', () => {
    const entries = generateSeedEntries(120)
    expect(entries[0].position).toEqual({ x: -9.5, z: -5.5 })
    expect(entries[1].position).toEqual({ x: -9, z: -5.5 })
    expect(entries[39].position).toEqual({ x: -9.5, z: -5 })
    for (const entry of entries) {
      expect(isOnGrid(entry.position.x)).toBe(true)
      expect(isOnGrid(entry.position.z)).toBe(true)
      expect(entry.position.x).toBeGreaterThanOrEqual(-9.5)
      expect(entry.position.x).toBeLessThanOrEqual(9.5)
      expect(entry.position.z).toBeGreaterThanOrEqual(-5.5)
      expect(entry.position.z).toBeLessThanOrEqual(5.5)
    }
  })

  it('cycles equipment types and 90 degree rotations', () => {
    const entries = generateSeedEntries(6)
    expect(entries.map((e) => e.type)).toEqual([
      'cabinet',
      'motor',
      'conveyor',
      'cabinet',
      'motor',
      'conveyor',
    ])
    expect(entries.map((e) => e.rotation)).toEqual([0, 90, 180, 270, 0, 90])
  })
})

describe('round1', () => {
  it('rounds to one decimal place', () => {
    expect(round1(59.96)).toBe(60)
    expect(round1(59.94)).toBe(59.9)
    expect(round1(0)).toBe(0)
  })
})
