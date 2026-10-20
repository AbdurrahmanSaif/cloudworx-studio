import { useMemo } from 'react'
import { summarizeBom } from '../../lib/bom'
import { useI18n } from '../../lib/i18n'
import { selectItems, useEditorStore } from '../../store/editorStore'
import { EquipmentGlyph } from './EquipmentGlyph'

export function BomTable() {
  const { t, typeLabel } = useI18n()
  const items = useEditorStore(selectItems)
  const rows = useMemo(() => summarizeBom(items), [items])

  if (rows.length === 0) {
    return <p className="table-empty">{t('bom.empty')}</p>
  }

  return (
    <table className="bom-table">
      <thead>
        <tr>
          <th>{t('bom.type')}</th>
          <th>{t('bom.qty')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.type}>
            <td>
              <span className="bom-name">
                <EquipmentGlyph type={row.type} size="xs" />
                {typeLabel(row.type)}
              </span>
            </td>
            <td className="bom-qty">{row.qty}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td>{t('bom.total')}</td>
          <td className="bom-qty">{items.length}</td>
        </tr>
      </tfoot>
    </table>
  )
}
