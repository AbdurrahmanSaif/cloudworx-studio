# Cloudworx Studio — 3D Industrial Layout Editor

A small 3D layout editor built for the Cloudworx Frontend Developer (React) take-home assessment (Part B). Sales engineers place equipment on a fixed 20 m × 12 m floor grid, edit the layout, see live rule violations, and read a bill of materials — in English or Vietnamese.

## Tech Stack

- **React 19 + TypeScript + Vite**
- **Three.js** via **React Three Fiber** and **Drei**
- **Zustand** for editor state and undo/redo
- **Tailwind CSS v4** for the interface
- **Vitest** for focused unit tests

## Getting Started

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`) in a modern browser (Chrome/Edge recommended).

### Other scripts

| Script              | Purpose                          |
| ------------------- | -------------------------------- |
| `npm run dev`       | Start dev server with HMR        |
| `npm run build`     | Type-check and production build  |
| `npm run preview`   | Preview the production build     |
| `npm run lint`      | Run ESLint                       |
| `npm test`          | Run unit tests once (Vitest)     |
| `npm run test:watch`| Run unit tests in watch mode     |

## Features

Status: **Milestone 5 complete** — live proximity rule. Remaining milestones in progress.

- [x] Project scaffold, Tailwind, Vitest, base layout regions
- [x] Typed layout model, Zustand store with immutable edits, snapshot undo/redo (56 unit tests)
- [x] Floor grid (20 m × 12 m, 0.5 m cells) and equipment palette (3 types: cabinet, motor, conveyor)
- [x] Place equipment with grid snapping; select, move (drag), rotate (90°), delete
- [x] Undo and redo for every edit (toolbar buttons; drags = one entry)
- [x] Placed-items list and properties panel with two-way selection sync
- [x] Live proximity rule (item centres < 0.6 m highlighted red in 3D, both names shown in warnings panel)
- [ ] Bill of materials table derived from the scene
- [ ] English / Vietnamese language toggle
- [ ] README with measured 500-item benchmark

## Architecture Notes

- **Single source of truth:** layout data (`LayoutItem[]` inside the store's undo/redo `History`) is the only place items exist. Three.js/R3F objects are pure renderers of that state — never application state.
- **Immutable edits:** every store action returns new arrays/objects; tests assert previous history states are not mutated.
- **Undo/redo:** snapshot-based (`src/store/history.ts`, pure + tested, capped at 100 entries). Continuous drags use a transform session (`beginTransform` → `previewItemPosition` → `endTransform`) so a whole drag becomes exactly one history entry; a click without movement creates none.
- **Pure logic separated from UI:** grid snapping/bounds, the proximity rule, and history live in `src/lib/` and `src/store/history.ts` as pure functions with unit tests (`npm test`, 53 tests).
- **Consistent placement:** every position change (add, drag, panel edit, rotation) goes through one entry point — snap to 0.5 m grid, then clamp the footprint inside the 20 × 12 m floor. Equipment footprints are defined in 1 m multiples so clamped positions always remain grid-aligned.
- **Selection sync:** the list, properties panel, toolbar and 3D viewport all read/write the same `selectedId` in the store — selecting in any surface updates the others.
- **Live rule:** violation detection runs as a memoised pure function over the item array on every layout change; the same violation ids drive the red 3D highlights, the red dots in the item list, and the warnings panel messages (both names + measured distance).
- **Component boundaries:** `src/components/editor/` holds R3F scene components; `src/components/ui/` holds DOM panels; `src/lib/i18n.ts` will hold EN/VI strings.

## Benchmark

_To be added after Milestone 7 with measured numbers (hardware, browser, FPS at 500 items). No invented results._

## Assumptions & Limitations

- Equipment uses simple three.js primitives (no external glTF models) per assessment guidance to spend time on editor behaviour.
- Proximity rule measures centre-to-centre distance **on the ground plane (x/z)**: items rest on the floor, so this keeps the rule independent of item height and consistent across equipment types. O(n²) pairwise check — fine at the assessed scale (hundreds of items); revisit if scenes grow to thousands.
- Selection (which item is active) is transient UI state and is **not** part of undo history: undoing a delete restores the item but does not re-select it.
- No backend, persistence, authentication, or collaboration (explicitly out of scope).

## AI Tooling

This project was built with the assistance of an AI coding agent (OpenCode, Claude model) for scaffolding, implementation, and checks, under the candidate's direction and review.
