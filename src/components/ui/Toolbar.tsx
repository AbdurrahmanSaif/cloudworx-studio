import { Layers2, Redo2, RotateCw, Trash2, Undo2 } from 'lucide-react'
import { useI18n } from '../../lib/i18n'
import {
  selectCanRedo,
  selectCanUndo,
  selectSelectedId,
  useEditorStore,
} from '../../store/editorStore'

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
    <div className="toolbar">
      <div
        className="tool-group"
        role="group"
        aria-label={t('toolbar.group.history')}
      >
        <button
          type="button"
          className="icon-btn"
          aria-label={t('toolbar.undo')}
          data-tooltip={t('toolbar.undo')}
          disabled={!canUndo}
          onClick={undo}
        >
          <Undo2 aria-hidden="true" />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={t('toolbar.redo')}
          data-tooltip={t('toolbar.redo')}
          disabled={!canRedo}
          onClick={redo}
        >
          <Redo2 aria-hidden="true" />
        </button>
      </div>

      <span className="toolbar-sep" aria-hidden="true" />

      <div
        className="tool-group"
        role="group"
        aria-label={t('toolbar.group.edit')}
      >
        <button
          type="button"
          className="icon-btn"
          aria-label={t('toolbar.rotate')}
          data-tooltip={t('toolbar.rotate')}
          disabled={!hasSelection}
          onClick={() => selectedId && rotateItem(selectedId)}
        >
          <RotateCw aria-hidden="true" />
        </button>
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          aria-label={t('toolbar.delete')}
          data-tooltip={t('toolbar.delete')}
          disabled={!hasSelection}
          onClick={() => selectedId && deleteItem(selectedId)}
        >
          <Trash2 aria-hidden="true" />
        </button>
      </div>

      <div className="toolbar-status">
        {placingType !== null && (
          <span className="placing-chip" role="status">
            <span className="placing-chip__dot" aria-hidden="true" />
            {t('toolbar.placing', { type: typeLabel(placingType) })}
            <kbd className="key-cap">Esc</kbd>
          </span>
        )}
        <span className="scene-count">
          <Layers2 aria-hidden="true" />
          {t(count === 1 ? 'toolbar.items.one' : 'toolbar.items.other', {
            n: count,
          })}
        </span>
      </div>
    </div>
  )
}
