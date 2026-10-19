import { beforeEach, describe, expect, it } from 'vitest'
import { isOnGrid } from '../lib/grid'
import type { EditorState } from './editorStore'
import { createEditorStore, selectCanRedo, selectCanUndo } from './editorStore'
import type { StoreApi } from 'zustand/vanilla'

let store: StoreApi<EditorState>

beforeEach(() => {
  store = createEditorStore()
})

const state = () => store.getState()
const items = () => state().history.present

describe('addItem', () => {
  it('places an item snapped to the grid and selects it', () => {
    state().addItem('cabinet', { x: 1.3, z: 2.4 })
    expect(items()).toHaveLength(1)
    expect(items()[0].position).toEqual({ x: 1.5, z: 2.5 })
    expect(isOnGrid(items()[0].position.x)).toBe(true)
    expect(state().selectedId).toBe(items()[0].id)
  })

  it('clamps placement inside the floor', () => {
    state().addItem('motor', { x: 500, z: -500 })
    expect(items()[0].position).toEqual({ x: 9.5, z: -5.5 })
  })

  it('assigns increasing per-type sequence numbers', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    state().addItem('motor', { x: 4, z: 0 })
    state().addItem('cabinet', { x: 8, z: 0 })
    expect(items().map((i) => i.seq)).toEqual([1, 1, 2])
    expect(items().map((i) => i.type)).toEqual(['cabinet', 'motor', 'cabinet'])
  })

  it('records an undo entry', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    expect(selectCanUndo(state())).toBe(true)
  })
})

describe('deleteItem', () => {
  it('removes the item and clears its selection', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    const id = items()[0].id
    state().deleteItem(id)
    expect(items()).toHaveLength(0)
    expect(state().selectedId).toBeNull()
  })

  it('restores the same item on undo', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    const before = items()[0]
    state().deleteItem(before.id)
    expect(state().selectedId).toBeNull()
    state().undo()
    expect(items()).toEqual([before])
    // Selection itself is not part of undo history; it stays cleared.
    expect(state().selectedId).toBeNull()
  })

  it('ignores an unknown id', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    const pastLength = state().history.past.length
    state().deleteItem('missing')
    expect(items()).toHaveLength(1)
    expect(state().history.past).toHaveLength(pastLength)
  })
})

describe('rotateItem', () => {
  it('rotates in 90 degree steps and wraps at 360', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    const id = items()[0].id
    state().rotateItem(id)
    expect(items()[0].rotation).toBe(90)
    state().rotateItem(id)
    state().rotateItem(id)
    state().rotateItem(id)
    expect(items()[0].rotation).toBe(0)
  })

  it('re-clamps the footprint after rotating near an edge', () => {
    state().addItem('conveyor', { x: 0, z: 5.5 })
    const id = items()[0].id
    expect(items()[0].position.z).toBe(5.5)
    state().rotateItem(id)
    const item = items()[0]
    expect(item.rotation).toBe(90)
    // Rotated footprint is 1 x 3 m: centre must fit within z <= 4.5.
    expect(item.position.z).toBe(4.5)
    expect(isOnGrid(item.position.x)).toBe(true)
    expect(isOnGrid(item.position.z)).toBe(true)
  })
})

describe('translateItem', () => {
  it('snaps the new position and records one history entry', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    const id = items()[0].id
    state().translateItem(id, { x: 3.7, z: -1.2 })
    expect(items()[0].position).toEqual({ x: 3.5, z: -1 })
    expect(state().history.past).toHaveLength(2)
  })

  it('is a no-op when the snapped position is unchanged', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    const id = items()[0].id
    state().translateItem(id, { x: 0.1, z: -0.1 })
    expect(state().history.past).toHaveLength(1)
  })
})

describe('transform (drag) session', () => {
  it('records exactly one history entry for a whole drag', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    const id = items()[0].id
    const pastBefore = state().history.past.length

    state().beginTransform(id)
    state().previewItemPosition(id, { x: 1.2, z: 0.4 })
    state().previewItemPosition(id, { x: 2.4, z: 0.6 })
    state().endTransform()

    expect(items()[0].position).toEqual({ x: 2.5, z: 0.5 })
    expect(state().history.past).toHaveLength(pastBefore + 1)
    expect(state().transformId).toBeNull()
    state().undo()
    expect(items()[0].position).toEqual({ x: 0, z: 0 })
  })

  it('creates no history entry when nothing moved', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    state().addItem('motor', { x: 5, z: 0 })
    state().undo() // leaves a redo entry with one item present
    expect(selectCanRedo(state())).toBe(true)
    const id = items()[0].id
    const pastLength = state().history.past.length

    state().beginTransform(id)
    state().previewItemPosition(id, { x: 0.1, z: 0 }) // snaps back to 0,0
    state().endTransform()

    expect(state().transformId).toBeNull()
    expect(state().history.past).toHaveLength(pastLength)
    expect(items()[0].position).toEqual({ x: 0, z: 0 })
    // The untouched drag must not wipe the redo stack.
    expect(selectCanRedo(state())).toBe(true)
  })

  it('ignores previews outside a transform session', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    const id = items()[0].id
    state().previewItemPosition(id, { x: 5, z: 5 })
    expect(items()[0].position).toEqual({ x: 0, z: 0 })
  })

  it('blocks undo and redo while transforming', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    const id = items()[0].id
    state().beginTransform(id)
    expect(state().transformId).toBe(id)
    state().undo()
    expect(items()).toHaveLength(1)
    state().redo()
    expect(items()).toHaveLength(1)
    expect(state().transformId).toBe(id)
    state().endTransform()
    expect(state().transformId).toBeNull()
  })

  it('ignores a second transform while one is running', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    state().addItem('motor', { x: 5, z: 0 })
    const [first, second] = items()
    state().beginTransform(first.id)
    state().beginTransform(second.id)
    expect(state().transformId).toBe(first.id)
    state().endTransform()
  })
})

describe('placing mode', () => {
  it('arms and disarms the palette type', () => {
    expect(state().placingType).toBeNull()
    state().setPlacingType('conveyor')
    expect(state().placingType).toBe('conveyor')
    state().setPlacingType(null)
    expect(state().placingType).toBeNull()
  })

  it('keeps placing mode active after a placement', () => {
    state().setPlacingType('cabinet')
    state().addItem('cabinet', { x: 0, z: 0 })
    expect(state().placingType).toBe('cabinet')
    expect(items()).toHaveLength(1)
  })
})

describe('seedItems', () => {
  it('creates every item in a single history entry', () => {
    state().seedItems([
      { type: 'cabinet', position: { x: 0, z: 0 } },
      { type: 'motor', position: { x: 4, z: 0 } },
      { type: 'conveyor', position: { x: -4, z: 2 } },
    ])
    expect(items()).toHaveLength(3)
    expect(state().history.past).toHaveLength(1)
    expect(state().selectedId).toBeNull()
    expect(state().transformId).toBeNull()
    state().undo()
    expect(items()).toHaveLength(0)
  })

  it('continues per-type sequence numbers from existing items', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    state().seedItems([
      { type: 'cabinet', position: { x: 4, z: 0 } },
      { type: 'cabinet', position: { x: 8, z: 0 } },
    ])
    expect(items().map((i) => i.seq)).toEqual([1, 2, 3])
  })

  it('resolves every entry onto the grid and inside the floor', () => {
    state().seedItems([
      { type: 'cabinet', position: { x: 1.3, z: 2.4 } },
      { type: 'motor', position: { x: 500, z: -500 } },
      { type: 'conveyor', position: { x: -9.9, z: 5.9 }, rotation: 90 },
    ])
    for (const item of items()) {
      expect(isOnGrid(item.position.x)).toBe(true)
      expect(isOnGrid(item.position.z)).toBe(true)
      expect(Math.abs(item.position.x)).toBeLessThanOrEqual(9.5)
      expect(Math.abs(item.position.z)).toBeLessThanOrEqual(5.5)
    }
    expect(items()[0].position).toEqual({ x: 1.5, z: 2.5 })
    expect(items()[2].rotation).toBe(90)
  })

  it('ignores empty input and input during a transform', () => {
    state().seedItems([])
    expect(items()).toHaveLength(0)
    expect(state().history.past).toHaveLength(0)

    state().addItem('cabinet', { x: 0, z: 0 })
    state().beginTransform(items()[0].id)
    state().seedItems([{ type: 'motor', position: { x: 4, z: 0 } }])
    expect(items()).toHaveLength(1)
    state().endTransform()
  })
})

describe('undo / redo', () => {
  it('walks add, delete and rotate edits backwards and forwards', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    const id = items()[0].id
    state().rotateItem(id)
    state().deleteItem(id)

    expect(items()).toHaveLength(0)
    state().undo() // restore deletion
    expect(items()).toHaveLength(1)
    expect(items()[0].rotation).toBe(90)
    state().undo() // undo rotation
    expect(items()[0].rotation).toBe(0)
    state().undo() // undo add
    expect(items()).toHaveLength(0)

    state().redo()
    expect(items()).toHaveLength(1)
    expect(items()[0].rotation).toBe(0)
    state().redo()
    expect(items()[0].rotation).toBe(90)
    state().redo()
    expect(items()).toHaveLength(0)
  })

  it('clears the selection when the selected item is undone away', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    expect(state().selectedId).toBe(items()[0].id)
    state().undo()
    expect(items()).toHaveLength(0)
    expect(state().selectedId).toBeNull()
  })

  it('keeps the selection when the item still exists', () => {
    state().addItem('cabinet', { x: 0, z: 0 })
    state().addItem('motor', { x: 5, z: 0 })
    state().deleteItem(items()[0].id)
    state().undo()
    expect(state().selectedId).toBe(items()[1].id)
  })

  it('reports no undo/redo on a fresh store', () => {
    expect(selectCanUndo(state())).toBe(false)
    expect(selectCanRedo(state())).toBe(false)
  })
})
