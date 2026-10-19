import { Redo2, RotateCw, Trash2, Undo2 } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import {
  selectCanRedo,
  selectCanUndo,
  selectSelectedId,
  useEditorStore,
} from '../../store/editorStore'

const BTN =
  'inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40'
const NEUTRAL =
  'border-zinc-700 bg-zinc-800 text-zinc-200 hover:border-zinc-500 enabled:hover:bg-zinc-700'
const DANGER =
  'border-red-900/60 bg-red-950/60 text-red-300 hover:border-red-700 enabled:hover:bg-red-900/40'

export function Toolbar() {
  const { t, typeLabel } = useI18n()
  const canUndo = useEditorStore(selectCanUndo)
  const canRedo = useEditorStore(selectCanRedo)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const selectedId = useEditorStore(selectSelectedId)
  const rotateItem = useEditorStore((s) => s.rotateItem)
  const deleteItem = useEditorStore((s) => s.deleteItem)
  const placingType = useEditorStore((s) => s.placingType)
  const count = useEditorStore((s) => s.history.present.length)

  const hasSelection = selectedId !== null

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <button
        type="button"
        className={`${BTN} ${NEUTRAL}`}
        disabled={!canUndo}
        onClick={undo}
      >
        <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
        {t('toolbar.undo')}
      </button>
      <button
        type="button"
        className={`${BTN} ${NEUTRAL}`}
        disabled={!canRedo}
        onClick={redo}
      >
        <Redo2 className="h-3.5 w-3.5" aria-hidden="true" />
        {t('toolbar.redo')}
      </button>
      <span aria-hidden="true" className="mx-1 h-5 w-px bg-zinc-700" />
      <button
        type="button"
        className={`${BTN} ${NEUTRAL}`}
        disabled={!hasSelection}
        onClick={() => selectedId && rotateItem(selectedId)}
      >
        <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
        {t('toolbar.rotate')}
      </button>
      <button
        type="button"
        className={`${BTN} ${DANGER}`}
        disabled={!hasSelection}
        onClick={() => selectedId && deleteItem(selectedId)}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        {t('toolbar.delete')}
      </button>
      <div className="ml-auto flex items-center gap-3 text-xs text-zinc-500">
        {placingType !== null && (
          <span className="text-amber-400">
            {t('toolbar.placing', { type: typeLabel(placingType) })}
          </span>
        )}
        <span>{t(count === 1 ? 'toolbar.items.one' : 'toolbar.items.other', { n: count })}</span>
      </div>
    </div>
  )
}
