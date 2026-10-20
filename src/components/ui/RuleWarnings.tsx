import { CircleCheck, TriangleAlert } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '../../lib/i18n'
import { findProximityViolations } from '../../lib/rules'
import { selectItems, useEditorStore } from '../../store/editorStore'

export function RuleWarnings() {
  const { t, itemName } = useI18n()
  const items = useEditorStore(selectItems)
  const select = useEditorStore((s) => s.select)
  const violations = useMemo(() => findProximityViolations(items), [items])

  if (violations.length === 0) {
    return (
      <div className="rules-clear">
        <span className="rules-clear__icon">
          <CircleCheck aria-hidden="true" />
        </span>
        <div className="rules-clear__body">
          <span className="rules-clear__title">{t('rules.clear.title')}</span>
          <p className="rules-clear__text">{t('rules.empty')}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="rules-summary">
        <TriangleAlert aria-hidden="true" />
        <span>
          {t(
            violations.length === 1
              ? 'rules.count.one'
              : 'rules.count.other',
            { n: violations.length },
          )}
        </span>
        <span className="rules-summary__limit">0.60 m</span>
      </div>

      <ul className="rules-list">
        {violations.map((v) => (
          <li key={`${v.a.id}:${v.b.id}`}>
            <button
              type="button"
              onClick={() => select(v.a.id)}
              className="warning-card"
            >
              <span className="warning-title">
                <TriangleAlert aria-hidden="true" />
                <span>
                  {itemName(v.a)} ↔ {itemName(v.b)}
                </span>
              </span>
              <span className="warning-detail">
                {t('rules.detail', { d: v.distance.toFixed(2) })}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
