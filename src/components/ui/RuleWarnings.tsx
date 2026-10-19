import { TriangleAlert } from 'lucide-react'
import { useMemo } from 'react'
import { itemDisplayName } from '../../lib/labels'
import { findProximityViolations } from '../../lib/rules'
import { selectItems, useEditorStore } from '../../store/editorStore'

export function RuleWarnings() {
  const items = useEditorStore(selectItems)
  const select = useEditorStore((s) => s.select)
  const violations = useMemo(() => findProximityViolations(items), [items])

  if (violations.length === 0) {
    return (
      <div className="flex items-start gap-2 text-zinc-600">
        <span
          aria-hidden="true"
          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-600/70"
        />
        <p className="leading-relaxed">
          No clearance violations. Any two items whose centres are closer than
          0.6 m are highlighted in red and listed here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-red-400">
        <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
        {violations.length} violation{violations.length > 1 ? 's' : ''}
      </p>
      <ul className="flex flex-col gap-1.5">
        {violations.map((v) => (
          <li key={`${v.a.id}:${v.b.id}`}>
            <button
              type="button"
              onClick={() => select(v.a.id)}
              className="w-full rounded-md border border-red-900/60 bg-red-950/50 px-2 py-1.5 text-left transition-colors hover:border-red-700 hover:bg-red-900/40"
            >
              <span className="block text-xs font-medium text-red-200">
                {itemDisplayName(v.a)} ↔ {itemDisplayName(v.b)}
              </span>
              <span className="mt-0.5 block text-[10px] tabular-nums text-red-400/90">
                centres {v.distance.toFixed(2)} m apart · limit 0.60 m · click
                to select
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
