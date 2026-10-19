import type { ItemType, SeedEntry } from '../types'

export const SEED_COUNT = 500
export const MEASURE_DURATION_MS = 5_000

declare global {
  interface Window {
    /** Exposed by the dev-only bridge inside the Canvas for render statistics. */
    __cwxRenderInfo?: () => { drawCalls: number; triangles: number }
  }
}

const SEED_TYPES: readonly ItemType[] = ['cabinet', 'motor', 'conveyor']

/**
 * Generates `count` placements sweeping the floor row by row so the seeded
 * scene fills roughly half of the 20 x 12 m grid with mixed types and
 * rotations. Off-floor inputs are resolved by the store's placement rules.
 */
export function generateSeedEntries(count: number): SeedEntry[] {
  const entries: SeedEntry[] = []
  // Valid 1 m item centres on the 0.5 m grid: x in [-9.5, 9.5], z in [-5.5, 5.5].
  const cols = 39
  const rows = 23
  for (let i = 0; i < count; i += 1) {
    const col = i % cols
    const row = Math.floor(i / cols)
    if (row >= rows) break
    entries.push({
      type: SEED_TYPES[i % SEED_TYPES.length],
      position: { x: -9.5 + col * 0.5, z: -5.5 + row * 0.5 },
      rotation: (i % 4) * 90,
    })
  }
  return entries
}

export interface FpsStats {
  /** Total frames divided by total elapsed time. */
  avg: number
  /** Worst one-second window (or the average when the run was shorter). */
  min: number
  /** Best one-second window. */
  max: number
}

/** Samples requestAnimationFrame deltas for `durationMs` and resolves with FPS statistics. */
export function measureFps(durationMs: number): Promise<FpsStats> {
  return new Promise((resolve) => {
    let frames = 0
    let windowFrames = 0
    const started = performance.now()
    let windowStart = started
    const samples: number[] = []
    const loop = (now: number) => {
      frames += 1
      windowFrames += 1
      const windowElapsed = now - windowStart
      if (windowElapsed >= 1000) {
        samples.push((windowFrames * 1000) / windowElapsed)
        windowFrames = 0
        windowStart = now
      }
      const elapsed = now - started
      if (elapsed >= durationMs) {
        const avg = (frames * 1000) / elapsed
        const all = samples.length > 0 ? samples : [avg]
        resolve({
          avg,
          min: Math.min(...all),
          max: Math.max(...all),
        })
        return
      }
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  })
}

function detectBrowser(ua: string): string {
  const edge = ua.match(/Edg\/([\d.]+)/)
  if (edge) return `Edge ${edge[1]}`
  const chrome = ua.match(/Chrome\/([\d.]+)/)
  if (chrome) return `Chrome ${chrome[1]}`
  const firefox = ua.match(/Firefox\/([\d.]+)/)
  if (firefox) return `Firefox ${firefox[1]}`
  return 'unknown'
}

function detectGpu(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl2') ??
      canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) return 'unavailable'
    const dbg = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = dbg
      ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER)
    return typeof renderer === 'string' ? renderer : 'unknown'
  } catch {
    return 'unavailable'
  }
}

export interface HardwareInfo {
  browser: string
  gpu: string
  cores: number | null
  devicePixelRatio: number
}

export function detectHardware(): HardwareInfo {
  return {
    browser: detectBrowser(navigator.userAgent),
    gpu: detectGpu(),
    cores: navigator.hardwareConcurrency ?? null,
    devicePixelRatio: window.devicePixelRatio,
  }
}

export interface BenchResult extends HardwareInfo {
  durationMs: number
  itemCount: number
  avgFps: number
  minFps: number
  maxFps: number
  drawCalls: number | null
  triangles: number | null
  measuredAt: string
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function formatBenchSummary(r: BenchResult): string {
  const calls = r.drawCalls === null ? 'n/a' : `${r.drawCalls} calls`
  return `avg ${round1(r.avgFps)} · min ${round1(r.minFps)} fps · ${r.itemCount} items · ${calls}`
}
