import { useMemo } from 'react'
import { EQUIPMENT } from '../../lib/catalog'
import { summarizeBom } from '../../lib/bom'
import { useI18n } from '../../lib/i18n'
import { selectItems, useEditorStore } from '../../store/editorStore'

export function BomTable() {
  const { t, typeLabel } = useI18n()
  const items = useEditorStore(selectItems)
  const rows = useMemo(() => summarizeBom(items), [items])

  if (rows.length === 0) {
    return <p className="leading-relaxed text-zinc-600">{t('bom.empty')}</p>
  }

  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr className="border-b border-zinc-700 text-left text-[10px] uppercase tracking-wide text-zinc-500">
          <th className="py-1.5 pr-2 font-semibold">{t('bom.type')}</th>
          <th className="py-1.5 text-right font-semibold">{t('bom.qty')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.type}
            className="border-b border-zinc-800/70 text-zinc-300"
          >
            <td className="py-1.5 pr-2">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: EQUIPMENT[row.type].color }}
                />
                {typeLabel(row.type)}
              </span>
            </td>
            <td className="py-1.5 text-right tabular-nums text-zinc-100">
              {row.qty}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t border-zinc-700 font-semibold text-zinc-200">
          <td className="py-1.5 pr-2">{t('bom.total')}</td>
          <td className="py-1.5 text-right tabular-nums text-zinc-100">
            {items.length}
          </td>
        </tr>
      </tfoot>
    </table>
  )
}
