export interface History<T> {
  past: T[]
  present: T
  future: T[]
}

export const MAX_HISTORY = 100

export function createHistory<T>(present: T): History<T> {
  return { past: [], present, future: [] }
}

/** Record an edit: current present moves to the past, future is discarded. */
export function pushHistory<T>(history: History<T>, next: T): History<T> {
  const past = [...history.past, history.present]
  if (past.length > MAX_HISTORY) {
    past.shift()
  }
  return { past, present: next, future: [] }
}

export function undoHistory<T>(history: History<T>): History<T> {
  if (history.past.length === 0) return history
  const previous = history.past[history.past.length - 1]
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  }
}

export function redoHistory<T>(history: History<T>): History<T> {
  if (history.future.length === 0) return history
  const next = history.future[0]
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  }
}

export function canUndo<T>(history: History<T>): boolean {
  return history.past.length > 0
}

export function canRedo<T>(history: History<T>): boolean {
  return history.future.length > 0
}
