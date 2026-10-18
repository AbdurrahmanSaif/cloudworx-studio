export function AppLayout() {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-4">
        <span className="text-sm font-semibold tracking-wide text-zinc-100">
          Cloudworx Studio
        </span>
        <div className="ml-auto flex items-center gap-2 text-xs text-zinc-500">
          Toolbar (milestone 3)
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/60">
          <Section title="Palette">Equipment palette (milestone 3)</Section>
          <Section title="Placed items" grow>
            Item list (milestone 4)
          </Section>
        </aside>

        <main className="relative min-w-0 flex-1 bg-zinc-950">
          <div className="absolute inset-0 grid place-items-center text-sm text-zinc-600">
            3D viewport (milestone 3)
          </div>
        </main>

        <aside className="flex w-80 shrink-0 flex-col border-l border-zinc-800 bg-zinc-900/60">
          <Section title="Properties">Properties panel (milestone 4)</Section>
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
  children: React.ReactNode
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
