import { useI18n } from '../../lib/i18n'
import { useEditorStore } from '../../store/editorStore'
import type { Lang } from '../../types'

const LANGS: readonly Lang[] = ['en', 'vi']

export function LangToggle() {
  const { t, lang } = useI18n()
  const setLang = useEditorStore((s) => s.setLang)

  return (
    <div
      role="group"
      aria-label={t('lang.aria')}
      className="flex shrink-0 overflow-hidden rounded border border-zinc-700 text-[11px]"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`px-2 py-1 font-semibold transition-colors ${
            lang === l
              ? 'bg-amber-500 text-zinc-950'
              : 'text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
