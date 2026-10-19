import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { editorStore, useEditorStore } from '../store/editorStore'
import { Scene } from './editor/Scene'
import { ItemList } from './ui/ItemList'
import { Palette } from './ui/Palette'
import { PropertiesPanel } from './ui/PropertiesPanel'
import { Toolbar } from './ui/Toolbar'

export function AppLayout() {
  const placingType = useEditorStore((s) => s.placingType)

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

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center gap-4 border-b border-zinc-800 bg-zinc-900 px-3">
        <span className="shrink-0 text-sm font-semibold tracking-wide text-zinc-100">
          Cloudworx Studio
        </span>
        <Toolbar />
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/60">
          <Section title="Palette">
            <Palette />
          </Section>
          <Section title="Placed items" grow>
            <ItemList />
          </Section>
        </aside>

        <main
          className={`relative min-w-0 flex-1 bg-zinc-950 ${
            placingType !== null ? 'cursor-crosshair' : ''
          }`}
        >
          <Scene />
        </main>

        <aside className="flex w-80 shrink-0 flex-col border-l border-zinc-800 bg-zinc-900/60">
          <Section title="Properties">
            <PropertiesPanel />
          </Section>
          <Section title="Rule warnings" grow>
            Proximity rules (milestone 5)
          </Section>
          <Section title="Bill of materials" grow>
            BOM table (milestone 6)
          </Section>
        </aside>
      </div>
    </div>
  )
}

function Section({
  title,
  grow = false,
  children,
}: {
  title: string
  grow?: boolean
  children: ReactNode
}) {
  return (
    <section
      className={`flex min-h-0 flex-col ${grow ? 'flex-1' : 'shrink-0'}`}
    >
      <h2 className="border-b border-zinc-800 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
      <div className="min-h-0 flex-1 overflow-auto p-3 text-xs text-zinc-600">
        {children}
      </div>
    </section>
  )
}
