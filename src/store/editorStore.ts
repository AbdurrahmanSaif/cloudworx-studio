import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import type { ItemType, Lang, LayoutItem, Vec2 } from '../types'
import { EQUIPMENT } from '../lib/catalog'
import {
  clampToFloor,
  resolvePlacement,
  rotatedFootprint,
  snapPosition,
} from '../lib/grid'
import {
  canRedo as historyCanRedo,
  canUndo as historyCanUndo,
  createHistory,
  pushHistory,
  redoHistory,
  undoHistory,
} from './history'
import type { History } from './history'

function createId(): string {
  return crypto.randomUUID()
}

function initialNextSeq(): Record<ItemType, number> {
  return { cabinet: 1, motor: 1, conveyor: 1 }
}

export interface EditorState {
  /** Single source of truth: layout data plus its undo/redo stacks. */
  history: History<LayoutItem[]>
  selectedId: string | null
  /** Session-scoped per-type name counters, outside the undo history. */
  nextSeq: Record<ItemType, number>
  /** Id of the item being dragged, or null when no transform is running. */
  transformId: string | null
  /** Palette mode: when set, the next floor click places this type. */
  placingType: ItemType | null
  /** UI language for the whole editor. */
  lang: Lang

  addItem: (type: ItemType, raw: Vec2) => void
  deleteItem: (id: string) => void
  rotateItem: (id: string) => void
  translateItem: (id: string, raw: Vec2) => void
  beginTransform: (id: string) => void
  previewItemPosition: (id: string, raw: Vec2) => void
  endTransform: () => void
  select: (id: string | null) => void
  setPlacingType: (type: ItemType | null) => void
  setLang: (lang: Lang) => void
  undo: () => void
  redo: () => void
}

export function createEditorStore() {
  return createStore<EditorState>()((set) => ({
    history: createHistory<LayoutItem[]>([]),
    selectedId: null,
    nextSeq: initialNextSeq(),
    transformId: null,
    placingType: null,
    lang: 'en',

    addItem: (type, raw) =>
      set((s) => {
        if (s.transformId !== null) return {}
        const seq = s.nextSeq[type]
        const item: LayoutItem = {
          id: createId(),
          type,
          seq,
          position: resolvePlacement(raw, EQUIPMENT[type].footprint),
          rotation: 0,
        }
        return {
          history: pushHistory(s.history, [...s.history.present, item]),
          nextSeq: { ...s.nextSeq, [type]: seq + 1 },
          selectedId: item.id,
        }
      }),

    deleteItem: (id) =>
      set((s) => {
        if (s.transformId !== null) return {}
        const items = s.history.present
        if (!items.some((i) => i.id === id)) return {}
        return {
          history: pushHistory(
            s.history,
            items.filter((i) => i.id !== id),
          ),
          selectedId: s.selectedId === id ? null : s.selectedId,
        }
      }),

    rotateItem: (id) =>
      set((s) => {
        if (s.transformId !== null) return {}
        const items = s.history.present
        const index = items.findIndex((i) => i.id === id)
        if (index === -1) return {}
        const item = items[index]
        const rotation = (item.rotation + 90) % 360
        const footprint = rotatedFootprint(
          EQUIPMENT[item.type].footprint,
          rotation,
        )
        const position = clampToFloor(snapPosition(item.position), footprint)
        const next = [...items]
        next[index] = { ...item, rotation, position }
        return { history: pushHistory(s.history, next) }
      }),

    translateItem: (id, raw) =>
      set((s) => {
        if (s.transformId !== null) return {}
        const items = s.history.present
        const index = items.findIndex((i) => i.id === id)
        if (index === -1) return {}
        const item = items[index]
        const position = resolvePlacement(
          raw,
          rotatedFootprint(EQUIPMENT[item.type].footprint, item.rotation),
        )
        if (
          position.x === item.position.x &&
          position.z === item.position.z
        ) {
          return {}
        }
        const next = [...items]
        next[index] = { ...item, position }
        return { history: pushHistory(s.history, next) }
      }),

    beginTransform: (id) =>
      set((s) => {
        if (s.transformId !== null) return {}
        return {
          transformId: id,
          history: {
            ...s.history,
            past: [...s.history.past, s.history.present],
          },
        }
      }),

    previewItemPosition: (id, raw) =>
      set((s) => {
        if (s.transformId !== id) return {}
        const items = s.history.present
        let changed = false
        const next = items.map((item) => {
          if (item.id !== id) return item
          const position = resolvePlacement(
            raw,
            rotatedFootprint(EQUIPMENT[item.type].footprint, item.rotation),
          )
          if (
            position.x === item.position.x &&
            position.z === item.position.z
          ) {
            return item
          }
          changed = true
          return { ...item, position }
        })
        if (!changed) return {}
        return { history: { ...s.history, present: next } }
      }),

    endTransform: () =>
      set((s) => {
        if (s.transformId === null) return {}
        const { past, present, future } = s.history
        const last = past[past.length - 1]
        if (last === present) {
          // Nothing moved: drop the placeholder entry, keep the redo stack.
          return {
            transformId: null,
            history: { past: past.slice(0, -1), present, future },
          }
        }
        // Real change: the pre-drag snapshot stays in the past.
        return {
          transformId: null,
          history: { past, present, future: [] },
        }
      }),

    select: (id) => set(() => ({ selectedId: id })),

    setPlacingType: (type) => set(() => ({ placingType: type })),

    setLang: (lang) => set(() => ({ lang })),

    undo: () =>
      set((s) => {
        if (s.transformId !== null) return {}
        const history = undoHistory(s.history)
        if (history === s.history) return {}
        const selectedId =
          history.present.some((i) => i.id === s.selectedId)
            ? s.selectedId
            : null
        return { history, selectedId }
      }),

    redo: () =>
      set((s) => {
        if (s.transformId !== null) return {}
        const history = redoHistory(s.history)
        if (history === s.history) return {}
        const selectedId =
          history.present.some((i) => i.id === s.selectedId)
            ? s.selectedId
            : null
        return { history, selectedId }
      }),
  }))
}

export const editorStore = createEditorStore()

export function useEditorStore<T>(selector: (state: EditorState) => T): T {
  return useStore(editorStore, selector)
}

export const selectItems = (s: EditorState): readonly LayoutItem[] =>
  s.history.present
export const selectSelectedId = (s: EditorState): string | null =>
  s.selectedId
export const selectCanUndo = (s: EditorState): boolean =>
  historyCanUndo(s.history)
export const selectCanRedo = (s: EditorState): boolean =>
  historyCanRedo(s.history)
