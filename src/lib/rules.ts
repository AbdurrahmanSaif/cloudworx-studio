import type { LayoutItem } from '../types'

export const PROXIMITY_THRESHOLD_M = 0.6

export interface ProximityViolation {
  a: LayoutItem
  b: LayoutItem
  distance: number
}

/**
 * Live rule: any two item centres closer than the threshold.
 * Distance is measured on the ground plane (x/z) because items rest on the
 * floor — this keeps the rule independent of item height and consistent for
 * every equipment combination.
 */
export function findProximityViolations(
  items: readonly LayoutItem[],
  threshold: number = PROXIMITY_THRESHOLD_M,
): ProximityViolation[] {
  const violations: ProximityViolation[] = []
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]
      const b = items[j]
      const dx = a.position.x - b.position.x
      const dz = a.position.z - b.position.z
      const distance = Math.hypot(dx, dz)
      if (distance < threshold) {
        violations.push({ a, b, distance })
      }
    }
  }
  return violations
}

/** Ids of every item involved in at least one violation (for highlighting). */
export function collectViolationIds(
  violations: readonly ProximityViolation[],
): Set<string> {
  const ids = new Set<string>()
  for (const v of violations) {
    ids.add(v.a.id)
    ids.add(v.b.id)
  }
  return ids
}
