import { Info, Plus, X } from 'lucide-react'
import { EQUIPMENT, ITEM_TYPES } from '../../lib/catalog'
import { useI18n } from '../../lib/i18n'
import { useEditorStore } from '../../store/editorStore'
import { EquipmentGlyph } from './EquipmentGlyph'

export function Palette() {
  const { t, typeLabel } = useI18n()
  const placingType = useEditorStore((s) => s.placingType)
  const setPlacingType = useEditorStore((s) => s.setPlacingType)

  return (
    <div className="palette">
      {ITEM_TYPES.map((type) => {
        const active = placingType === type
        const def = EQUIPMENT[type]
        return (
          <button
            key={type}
            type="button"
            aria-pressed={active}
            onClick={() => setPlacingType(active ? null : type)}
            className={`palette-item ${active ? 'is-active' : ''}`}
          >
            <EquipmentGlyph type={type} size="md" />
            <span className="palette-item-main">
              <span className="palette-name">{typeLabel(type)}</span>
              <span className="palette-meta">
                {def.footprint.width} × {def.footprint.depth} m · H{' '}
                {def.height} m
              </span>
            </span>
            <span className="palette-add" aria-hidden="true">
              {active ? <X /> : <Plus />}
            </span>
          </button>
        )
      })}

      <div
        className={`sidebar-hint ${placingType !== null ? 'sidebar-hint--active' : ''}`}
      >
        <Info aria-hidden="true" />
        <span>
          {placingType !== null
            ? t('palette.hint.placing', { type: typeLabel(placingType) })
            : t('palette.hint.pick')}
        </span>
      </div>
    </div>
  )
}
