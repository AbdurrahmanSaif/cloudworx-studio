import { X } from 'lucide-react'
import { useMemo } from 'react'
import { EQUIPMENT } from '../../lib/catalog'
import { itemDisplayName } from '../../lib/labels'
import { collectViolationIds, findProximityViolations } from '../../lib/rules'
import {
  selectItems,
  selectSelectedId,
  useEditorStore,
} from '../../store/editorStore'

export function ItemList() {
  const items = useEditorStore(selectItems)
  const selectedId = useEditorStore(selectSelectedId)
  const select = useEditorStore((s) => s.select)
  const deleteItem = useEditorStore((s) => s.deleteItem)
  const violatedIds = useMemo(
    () => collectViolationIds(findProximityViolations(items)),
    [items],
  )

  if (items.length === 0) {
    return (
      <p className="leading-relaxed text-zinc-600">
        Nothing placed yet. Pick a type in the palette, then click the floor.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const selected = item.id === selectedId
        const name = itemDisplayName(item)
        return (
          <li key={item.id} className="flex items-center gap-1">
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => select(item.id)}
              className={`flex min-w-0 flex-1 items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition-colors ${
                selected
                  ? 'border-amber-500/70 bg-amber-500/10 text-amber-100'
                  : 'border-transparent bg-zinc-800/30 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/60'
              }`}
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: EQUIPMENT[item.type].color }}
              />
              <span className="min-w-0 flex-1 truncate">{name}</span>
              {violatedIds.has(item.id) && (
                <span
                  aria-label="Clearance violation"
                  className="h-2 w-2 shrink-0 rounded-full bg-red-500"
                />
              )}
              <span className="shrink-0 text-[10px] tabular-nums text-zinc-500">
                {item.position.x.toFixed(1)}, {item.position.z.toFixed(1)}
              </span>
            </button>
            <button
              type="button"
              aria-label={`Delete ${name}`}
              onClick={() => deleteItem(item.id)}
              className="shrink-0 rounded border border-transparent p-1 text-zinc-600 transition-colors hover:border-red-900/60 hover:bg-red-950/60 hover:text-red-300"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
