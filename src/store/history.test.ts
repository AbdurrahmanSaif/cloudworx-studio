import { describe, expect, it } from 'vitest'
import {
  MAX_HISTORY,
  canRedo,
  canUndo,
  createHistory,
  pushHistory,
  redoHistory,
  undoHistory,
} from './history'

describe('createHistory', () => {
  it('starts with only a present', () => {
    const h = createHistory('a')
    expect(h).toEqual({ past: [], present: 'a', future: [] })
    expect(canUndo(h)).toBe(false)
    expect(canRedo(h)).toBe(false)
  })
})

describe('pushHistory', () => {
  it('moves the current present into the past', () => {
    const h = pushHistory(createHistory('a'), 'b')
    expect(h).toEqual({ past: ['a'], present: 'b', future: [] })
    expect(canUndo(h)).toBe(true)
  })

  it('discards the redo stack', () => {
    let h = pushHistory(createHistory('a'), 'b')
    h = undoHistory(h)
    expect(h.future).toEqual(['b'])
    h = pushHistory(h, 'c')
    expect(h.future).toEqual([])
    expect(h).toEqual({ past: ['a'], present: 'c', future: [] })
  })

  it('does not mutate the previous history state', () => {
    const before = createHistory('a')
    pushHistory(before, 'b')
    expect(before).toEqual({ past: [], present: 'a', future: [] })
  })

  it('caps the past at MAX_HISTORY entries', () => {
    let h = createHistory(0)
    for (let i = 1; i <= MAX_HISTORY + 50; i++) {
      h = pushHistory(h, i)
    }
    expect(h.past).toHaveLength(MAX_HISTORY)
    expect(h.present).toBe(MAX_HISTORY + 50)
    expect(h.past[0]).toBe(50)
  })
})

describe('undoHistory', () => {
  it('restores the previous present and moves current to future', () => {
    const h = pushHistory(createHistory('a'), 'b')
    expect(undoHistory(h)).toEqual({ past: [], present: 'a', future: ['b'] })
  })

  it('is a no-op on an empty past', () => {
    const h = createHistory('a')
    expect(undoHistory(h)).toBe(h)
  })

  it('walks back through several edits', () => {
    let h = pushHistory(createHistory('a'), 'b')
    h = pushHistory(h, 'c')
    h = undoHistory(h)
    expect(h.present).toBe('b')
    h = undoHistory(h)
    expect(h.present).toBe('a')
    expect(canUndo(h)).toBe(false)
  })
})

describe('redoHistory', () => {
  it('re-applies an undone edit', () => {
    let h = pushHistory(createHistory('a'), 'b')
    h = undoHistory(h)
    expect(redoHistory(h)).toEqual({ past: ['a'], present: 'b', future: [] })
  })

  it('is a no-op on an empty future', () => {
    const h = createHistory('a')
    expect(redoHistory(h)).toBe(h)
  })

  it('supports a full undo/redo round trip', () => {
    let h = pushHistory(createHistory('a'), 'b')
    h = pushHistory(h, 'c')
    h = undoHistory(h)
    h = undoHistory(h)
    expect(h.present).toBe('a')
    h = redoHistory(h)
    expect(h.present).toBe('b')
    h = redoHistory(h)
    expect(h.present).toBe('c')
    expect(h.future).toEqual([])
    expect(canRedo(h)).toBe(false)
  })
})
