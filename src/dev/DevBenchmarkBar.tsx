import { useEffect, useState } from 'react'
import { editorStore, useEditorStore } from '../store/editorStore'
import {
  MEASURE_DURATION_MS,
  SEED_COUNT,
  detectHardware,
  formatBenchSummary,
  generateSeedEntries,
  measureFps,
  round1,
} from './benchmark'
import type { BenchResult } from './benchmark'

function useLiveFps(): number {
  const [fps, setFps] = useState(0)
  useEffect(() => {
    let raf = 0
    let frames = 0
    let last = performance.now()
    const loop = (now: number) => {
      frames += 1
      const elapsed = now - last
      if (elapsed >= 1000) {
        setFps(Math.round((frames * 1000) / elapsed))
        frames = 0
        last = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return fps
}

/**
 * Dev-only benchmark controls rendered in the header: seeds 500 items in one
 * undo step, samples FPS for five seconds and logs a full JSON report.
 * Stripped from production renders by the `import.meta.env.DEV` guard.
 */
export function DevBenchmarkBar() {
  const itemCount = useEditorStore((s) => s.history.present.length)
  const liveFps = useLiveFps()
  const [measuring, setMeasuring] = useState(false)
  const [result, setResult] = useState<BenchResult | null>(null)

  const seed = () => {
    editorStore.getState().seedItems(generateSeedEntries(SEED_COUNT))
  }

  const run = async () => {
    setMeasuring(true)
    try {
      const stats = await measureFps(MEASURE_DURATION_MS)
      const info = window.__cwxRenderInfo?.() ?? null
      const bench: BenchResult = {
        durationMs: MEASURE_DURATION_MS,
        itemCount: editorStore.getState().history.present.length,
        avgFps: round1(stats.avg),
        minFps: round1(stats.min),
        maxFps: round1(stats.max),
        drawCalls: info?.drawCalls ?? null,
        triangles: info?.triangles ?? null,
        measuredAt: new Date().toISOString(),
        ...detectHardware(),
      }
      setResult(bench)
      console.info(
        '[cloudworx benchmark]',
        JSON.stringify(bench, null, 2),
      )
    } finally {
      setMeasuring(false)
    }
  }

  return (
    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
      <button
        type="button"
        onClick={seed}
        disabled={measuring}
        className="rounded border border-zinc-700 px-2 py-1 transition-colors hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40"
      >
        Seed {SEED_COUNT}
      </button>
      <button
        type="button"
        onClick={() => void run()}
        disabled={measuring}
        className="rounded border border-zinc-700 px-2 py-1 transition-colors hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40"
      >
        {measuring ? 'Measuring…' : `Measure ${MEASURE_DURATION_MS / 1000}s`}
      </button>
      <span className="tabular-nums" title="Live frames per second">
        {liveFps} fps
      </span>
      {result && (
        <span className="hidden tabular-nums text-zinc-500 xl:inline">
          {formatBenchSummary(result)}
        </span>
      )}
      <span className="tabular-nums text-zinc-600" title="Items in the scene">
        {itemCount} items
      </span>
    </div>
  )
}
