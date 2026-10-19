import { RotateCw, Trash2 } from 'lucide-react'
import type { FocusEvent, ReactNode } from 'react'
import { EQUIPMENT } from '../../lib/catalog'
import { useI18n } from '../../lib/i18n'
import { useEditorStore } from '../../store/editorStore'
import type { LayoutItem } from '../../types'

export function PropertiesPanel() {
  const { t, itemName } = useI18n()
  const item = useEditorStore(
    (s) => s.history.present.find((i) => i.id === s.selectedId) ?? null,
  )

  if (item === null) {
    return <p className="leading-relaxed text-zinc-600">{t('props.empty')}</p>
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
    <div className="flex flex-col gap-3 text-xs">
      <Field label={t('props.name')}>
        <span className="text-zinc-100">{name}</span>
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <PositionField
          label={t('props.posX')}
          value={item.position.x}
          onCommit={(x) => translateItem(item.id, { x, z: item.position.z })}
        />
        <PositionField
          label={t('props.posZ')}
          value={item.position.z}
          onCommit={(z) => translateItem(item.id, { x: item.position.x, z })}
        />
      </div>
      <p className="-mt-1 text-[10px] text-zinc-600">{t('props.snapHint')}</p>

      <div className="grid grid-cols-2 gap-2">
        <Field label={t('props.rotation')}>
          <span className="tabular-nums text-zinc-100">{item.rotation}°</span>
        </Field>
        <Field label={t('props.type')}>
          <span className="text-zinc-100">
            {typeLabel(item.type)} · {def.footprint.width}×
            {def.footprint.depth} m
          </span>
        </Field>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => rotateItem(item.id)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-700"
        >
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          {t('props.rotate')}
        </button>
        <button
          type="button"
          onClick={() => deleteItem(item.id)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded border border-red-900/60 bg-red-950/60 px-2.5 py-1.5 text-red-300 transition-colors hover:border-red-700 hover:bg-red-900/40"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          {t('props.delete')}
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      {children}
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
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </span>
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
        className="rounded border border-zinc-700 bg-zinc-800/60 px-2 py-1.5 text-zinc-100 outline-none focus:border-amber-500"
      />
    </label>
  )
}
