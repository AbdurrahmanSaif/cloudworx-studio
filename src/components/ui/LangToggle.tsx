import { useI18n } from '../../lib/i18n'
import { useEditorStore } from '../../store/editorStore'
import type { Lang } from '../../types'

const LANGS: readonly Lang[] = ['en', 'vi']

export function LangToggle() {
  const { t, lang } = useI18n()
  const setLang = useEditorStore((s) => s.setLang)

  return (
    <div role="group" aria-label={t('lang.aria')} className="lang-toggle">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`lang-btn ${lang === l ? 'is-active' : ''}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
