import { EQUIPMENT, ITEM_TYPES } from '../../lib/catalog'
import { typeLabel } from '../../lib/labels'
import { useEditorStore } from '../../store/editorStore'

export function Palette() {
  const placingType = useEditorStore((s) => s.placingType)
  const setPlacingType = useEditorStore((s) => s.setPlacingType)

  return (
    <div className="flex flex-col gap-2">
      {ITEM_TYPES.map((type) => {
        const active = placingType === type
        const def = EQUIPMENT[type]
        return (
          <button
            key={type}
            type="button"
            onClick={() => setPlacingType(active ? null : type)}
            className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition-colors ${
              active
                ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                : 'border-zinc-700 bg-zinc-800/40 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            <span
              aria-hidden="true"
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: def.color }}
            />
            <span className="font-medium">{typeLabel(type)}</span>
            <span className="ml-auto text-[10px] text-zinc-500">
              {def.footprint.width}×{def.footprint.depth} m
            </span>
          </button>
        )
      })}
      <p className="text-[11px] leading-relaxed text-zinc-500">
        {placingType !== null
          ? `Click the floor to place ${typeLabel(placingType)} — Esc to cancel.`
          : 'Pick a type, then click the floor. Drag items to move them.'}
      </p>
    </div>
  )
}
