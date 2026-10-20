import { Boxes, TriangleAlert, X } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '../../lib/i18n'
import { collectViolationIds, findProximityViolations } from '../../lib/rules'
import {
  selectItems,
  selectSelectedId,
  useEditorStore,
} from '../../store/editorStore'
import { EquipmentGlyph } from './EquipmentGlyph'

export function ItemList() {
  const { t, itemName } = useI18n()
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
      <div className="empty-state">
        <span className="empty-state__icon">
          <Boxes aria-hidden="true" />
        </span>
        <span className="empty-state__title">{t('list.empty.title')}</span>
        <p className="empty-state__text">{t('list.empty')}</p>
      </div>
    )
  }

  return (
    <ul className="item-list">
      {items.map((item) => {
        const selected = item.id === selectedId
        const name = itemName(item)
        return (
          <li
            key={item.id}
            className={`item-row ${selected ? 'is-selected' : ''}`}
          >
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => select(item.id)}
              className="item-select"
            >
              <EquipmentGlyph type={item.type} size="sm" />
              <span className="item-main">
                <span className="item-name">{name}</span>
                <span className="item-meta">
                  X {item.position.x.toFixed(1)} · Z{' '}
                  {item.position.z.toFixed(1)}
                </span>
              </span>
              {violatedIds.has(item.id) && (
                <TriangleAlert
                  aria-label={t('list.violationAria')}
                  className="item-violation"
                />
              )}
            </button>
            <div className="item-actions">
              <button
                type="button"
                aria-label={`${t('toolbar.delete')}: ${name}`}
                onClick={() => deleteItem(item.id)}
                className="item-remove"
              >
                <X aria-hidden="true" />
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
