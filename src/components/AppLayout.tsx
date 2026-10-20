import {
  Boxes,
  Grid3x3,
  Mouse,
  MousePointerClick,
  PanelLeft,
  PanelRight,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useI18n } from '../lib/i18n'
import { editorStore, useEditorStore } from '../store/editorStore'
import { DevBenchmarkBar } from '../dev/DevBenchmarkBar'
import { Scene } from './editor/Scene'
import { BomTable } from './ui/BomTable'
import { ItemList } from './ui/ItemList'
import { LangToggle } from './ui/LangToggle'
import { Palette } from './ui/Palette'
import { PropertiesPanel } from './ui/PropertiesPanel'
import { RuleWarnings } from './ui/RuleWarnings'
import { Toolbar } from './ui/Toolbar'

type OpenPanel = 'left' | 'right' | null

export function AppLayout() {
  const { t, typeLabel } = useI18n()
  const placingType = useEditorStore((s) => s.placingType)
  const itemCount = useEditorStore((s) => s.history.present.length)
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const s = editorStore.getState()
      if (s.placingType !== null) s.setPlacingType(null)
      else s.select(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const togglePanel = (panel: Exclude<OpenPanel, null>) => {
    setOpenPanel((current) => (current === panel ? null : panel))
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <Boxes />
          </span>
          <span className="brand-text">
            <span className="brand-name">
              Cloudworx <em>Studio</em>
            </span>
            <span className="brand-sub">Industrial Layout</span>
          </span>
        </div>

        <Toolbar />

        <div className="mobile-panel-toggles">
          <button
            type="button"
            className={`icon-btn ${openPanel === 'left' ? 'is-active' : ''}`}
            aria-label={t('section.palette')}
            aria-controls="equipment-panel"
            aria-expanded={openPanel === 'left'}
            data-tooltip={t('section.palette')}
            onClick={() => togglePanel('left')}
          >
            <PanelLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`icon-btn ${openPanel === 'right' ? 'is-active' : ''}`}
            aria-label={t('section.props')}
            aria-controls="inspector-panel"
            aria-expanded={openPanel === 'right'}
            data-tooltip={t('section.props')}
            onClick={() => togglePanel('right')}
          >
            <PanelRight aria-hidden="true" />
          </button>
        </div>

        <div className="topbar-actions">
          <LangToggle />
          {import.meta.env.DEV && (
            <div className="bench-shell">
              <DevBenchmarkBar />
            </div>
          )}
        </div>
      </header>

      <div className="app-body">
        <aside
          id="equipment-panel"
          className={`sidebar sidebar-left ${openPanel === 'left' ? 'is-open' : ''}`}
          aria-label={t('section.palette')}
        >
          <Section title={t('section.palette')}>
            <div onClick={() => setOpenPanel(null)}>
              <Palette />
            </div>
          </Section>
          <Section
            title={t('section.items')}
            count={itemCount}
            grow
            scroll
          >
            <ItemList />
          </Section>
        </aside>

        <main
          className={`viewport-shell ${placingType !== null ? 'is-placing' : ''}`}
        >
          <Scene />
          <div className="viewport-overlay">
            <div className="viewport-topline">
              <div className="viewport-chips">
                <span className="viewport-chip">
                  <Grid3x3 aria-hidden="true" />
                  {t('viewport.floor')}
                </span>
              </div>
              <div className="viewport-chips" />
            </div>

            <div className="viewport-bottomline">
              <span className="viewport-nav-hint">
                <Mouse aria-hidden="true" />
                {t('viewport.nav')}
              </span>
              <div className="viewport-hint-slot">
                {placingType !== null && (
                  <div className="viewport-place-hint" role="status">
                    <MousePointerClick aria-hidden="true" />
                    <span>
                      <strong>{t('toolbar.placing', {
                        type: typeLabel(placingType),
                      })}</strong>
                      <span className="hint-sep">·</span>
                      {t('viewport.placeHint')}
                    </span>
                    <kbd className="key-cap">Esc</kbd>
                  </div>
                )}
              </div>
              <span className="viewport-bottom-spacer" aria-hidden="true" />
            </div>
          </div>
        </main>

        <aside
          id="inspector-panel"
          className={`sidebar sidebar-right ${openPanel === 'right' ? 'is-open' : ''}`}
          aria-label={t('section.props')}
        >
          <Section title={t('section.props')}>
            <PropertiesPanel />
          </Section>
          <Section title={t('section.rules')} grow scroll>
            <RuleWarnings />
          </Section>
          <Section title={t('section.bom')} count={itemCount}>
            <BomTable />
          </Section>
        </aside>

        <div
          className={`sidebar-backdrop ${openPanel !== null ? 'is-visible' : ''}`}
          aria-hidden="true"
          onClick={() => setOpenPanel(null)}
        />
      </div>
    </div>
  )
}

function Section({
  title,
  count,
  grow = false,
  scroll = false,
  children,
}: {
  title: string
  count?: number
  grow?: boolean
  scroll?: boolean
  children: ReactNode
}) {
  return (
    <section
      className={`panel-section ${grow ? 'panel-section--grow' : ''}`}
    >
      <div className="panel-head">
        <h2 className="panel-title">{title}</h2>
        {count !== undefined && (
          <span className="panel-count">{count}</span>
        )}
      </div>
      <div className={`panel-body ${scroll ? 'panel-body--scroll' : ''}`}>
        {children}
      </div>
    </section>
  )
}
