import { Grid3x3, MousePointerClick, RotateCw, Trash2 } from 'lucide-react'
import type { FocusEvent } from 'react'
import { EQUIPMENT } from '../../lib/catalog'
import { useI18n } from '../../lib/i18n'
import { useEditorStore } from '../../store/editorStore'
import type { LayoutItem } from '../../types'
import { EquipmentGlyph } from './EquipmentGlyph'

export function PropertiesPanel() {
  const { t, itemName } = useI18n()
  const item = useEditorStore(
    (s) => s.history.present.find((i) => i.id === s.selectedId) ?? null,
  )

  if (item === null) {
    return (
      <div className="empty-state">
        <span className="empty-state__icon">
          <MousePointerClick aria-hidden="true" />
        </span>
        <span className="empty-state__title">{t('props.empty.title')}</span>
        <p className="empty-state__text">{t('props.empty')}</p>
      </div>
    )
  }
  // Remount per item so field drafts reset when the selection changes.
  return (
    <PropertiesForm key={item.id} item={item} name={itemName(item)} />
  )
}

function PropertiesForm({ item, name }: { item: LayoutItem; name: string }) {
  const { t, typeLabel } = useI18n()
  const translateItem = useEditorStore((s) => s.translateItem)
  const rotateItem = useEditorStore((s) => s.rotateItem)
  const deleteItem = useEditorStore((s) => s.deleteItem)
  const def = EQUIPMENT[item.type]

  return (
    <div className="props">
      <div className="props-header">
        <EquipmentGlyph type={item.type} size="lg" />
        <div className="props-heading">
          <span className="props-title">{name}</span>
          <span className="props-sub">
            {typeLabel(item.type)} · {def.footprint.width} ×{' '}
            {def.footprint.depth} × {def.height} m
          </span>
        </div>
      </div>

      <div>
        <div className="field-grid">
          <PositionField
            label={t('props.posX')}
            value={item.position.x}
            onCommit={(x) =>
              translateItem(item.id, { x, z: item.position.z })
            }
          />
          <PositionField
            label={t('props.posZ')}
            value={item.position.z}
            onCommit={(z) =>
              translateItem(item.id, { x: item.position.x, z })
            }
          />
        </div>
        <p className="field-hint">
          <Grid3x3 aria-hidden="true" />
          <span>{t('props.snapHint')}</span>
        </p>
      </div>

      <div className="meta-grid">
        <div className="meta-cell">
          <span className="meta-label">{t('props.rotation')}</span>
          <span className="meta-value tabular">{item.rotation}°</span>
        </div>
        <div className="meta-cell">
          <span className="meta-label">{t('props.type')}</span>
          <span className="meta-value">
            <span
              aria-hidden="true"
              className="meta-dot"
              style={{ backgroundColor: def.color }}
            />
            {typeLabel(item.type)}
          </span>
        </div>
      </div>

      <div className="action-row">
        <button
          type="button"
          onClick={() => rotateItem(item.id)}
          className="btn btn--flex"
        >
          <RotateCw aria-hidden="true" />
          {t('props.rotate')}
        </button>
        <button
          type="button"
          onClick={() => deleteItem(item.id)}
          className="btn btn--danger"
        >
          <Trash2 aria-hidden="true" />
          {t('props.delete')}
        </button>
      </div>
    </div>
  )
}

function PositionField({
  label,
  value,
  onCommit,
}: {
  label: string
  value: number
  onCommit: (value: number) => void
}) {
  const commit = (e: FocusEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const parsed = Number.parseFloat(input.value)
    if (Number.isFinite(parsed)) onCommit(parsed)
    else input.value = String(value)
  }

  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {/* key remounts the uncontrolled input whenever the committed value
          changes (snap, undo, drag) so it always shows the store value. */}
      <input
        key={value}
        type="number"
        step={0.5}
        defaultValue={value}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
        className="text-input"
      />
    </label>
  )
}
