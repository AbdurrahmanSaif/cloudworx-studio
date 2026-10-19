import { Archive, Cog, MoveHorizontal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { EQUIPMENT, ITEM_TYPES } from '../../lib/catalog'
import { useI18n } from '../../lib/i18n'
import type { ItemType } from '../../types'
import { useEditorStore } from '../../store/editorStore'

const TYPE_ICONS: Record<ItemType, LucideIcon> = {
  cabinet: Archive,
  motor: Cog,
  conveyor: MoveHorizontal,
}

export function Palette() {
  const { t, typeLabel } = useI18n()
  const placingType = useEditorStore((s) => s.placingType)
  const setPlacingType = useEditorStore((s) => s.setPlacingType)

  return (
    <div className="flex flex-col gap-2">
      {ITEM_TYPES.map((type) => {
        const active = placingType === type
        const def = EQUIPMENT[type]
        const Icon = TYPE_ICONS[type]
        return (
          <button
            key={type}
            type="button"
            aria-pressed={active}
            onClick={() => setPlacingType(active ? null : type)}
            className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition-colors ${
              active
                ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                : 'border-zinc-700 bg-zinc-800/40 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            <Icon
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: def.color }}
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
          ? t('palette.hint.placing', { type: typeLabel(placingType) })
          : t('palette.hint.pick')}
      </p>
    </div>
  )
}
