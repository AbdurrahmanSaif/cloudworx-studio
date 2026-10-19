# Cloudworx Studio — 3D Industrial Layout Editor

**Part B submission** for the Cloudworx Frontend Developer (React) technical assessment.

A small 3D layout editor: sales engineers place equipment on a fixed 20 m × 12 m floor grid, move, rotate and delete items with full undo/redo, see live proximity rule violations, and read a bill of materials — in English or Vietnamese.

> **Headline result:** **75.3 average FPS with 500 items placed** on integrated graphics (Intel Iris Xe, Chrome 155) — measured in-app, reproduce in ~1 minute, see [Benchmark](#benchmark-500-items-measured).

## Quick Start (run it locally)

**Prerequisites:** [Node.js](https://nodejs.org) matching Vite 8's engines — `^20.19.0 || >=22.12.0` (verified here on Node 22.18.0 / npm 8.19.2) — and a modern desktop browser (Chrome/Edge recommended; WebGL2 required).

```bash
npm install
npm run dev
```

Open the printed local URL (default **http://localhost:5173**) — you should see the editor with the floor grid, palette and panels immediately. No backend, login or environment variables are needed.

### Scripts

| Script               | Purpose                         |
| -------------------- | ------------------------------- |
| `npm run dev`        | Start dev server with HMR       |
| `npm run build`      | Type-check and production build |
| `npm run preview`    | Preview the production build    |
| `npm run lint`       | Run ESLint                      |
| `npm test`           | Run unit tests once (Vitest)    |
| `npm run test:watch` | Run unit tests in watch mode    |

Quality gates, all green at submission: `npx tsc -b` · `npm run lint` · `npm test` (**76 tests / 7 files**) · `npm run build`.

## How to Use the Editor

- **Place:** click a type in the **Palette**, then click the floor — items snap to the 0.5 m grid. Placing mode stays armed (click another type to switch, `Esc` to exit).
- **Select:** click an item in the 3D view **or** a row in the **Placed items** list — selection is always synchronised both ways. Click empty floor to deselect.
- **Move:** drag the selected item; it follows the pointer snapped to the grid and clamped inside the floor.
- **Rotate / Delete / Undo / Redo:** toolbar buttons in the header (rotation steps 90°, the footprint re-clamps to stay inside the floor).
- **Edit numerically:** the **Properties** panel edits the selected item's coordinates and shows its type, name and rotation.
- **Rule violations:** any two items whose centres are closer than **0.6 m** turn red in the 3D view; the **Rule warnings** panel names both items with the measured distance and jumps to them on click.
- **Bill of materials:** counted live from the scene (type quantities + total).
- **Language:** `EN | VI` toggle in the header switches every UI string.
- **Navigate the 3D view:** drag to orbit, scroll to zoom, right-drag to pan.

_Dev only:_ the header also shows **Seed 500** / **Measure 5s** / live FPS controls (development builds only — they do not exist in `npm run build` output).

## Part B Requirements Coverage

| # | Required (assessment §5)                                                                                                                | Where / status                                                                                    |
| - | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1 | Floor grid 20 m × 12 m with 0.5 m cells, palette of ≥ 3 item types (glTF with source, or primitives)                                     | `src/lib/grid.ts`, `src/lib/catalog.ts`, `Palette` — simple three.js primitives (no third-party models) ✅ |
| 2 | Place from palette with grid snapping; select, move, rotate, delete                                                                      | `editorStore` + `Scene` (`InteractionPlane`, `DragController`) + toolbar/properties ✅               |
| 3 | Undo and redo for every edit                                                                                                            | `src/store/history.ts` (snapshot, tested) + one-entry-per-drag transform sessions ✅               |
| 4 | Placed-items list and properties panel, selection in sync both ways with the 3D view                                                     | shared `selectedId` in the store; `ItemList`, `PropertiesPanel`, 3D selection ✅                    |
| 5 | Live rule: two items closer than 0.6 m highlighted, message naming both                                                                  | `src/lib/rules.ts` + red highlights in 3D + `RuleWarnings` (both names + distance) ✅               |
| 6 | Bill of materials counted from the scene, English + Vietnamese toggle (machine-translated fine)                                          | `src/lib/bom.ts` + `BomTable`; `src/lib/i18n.ts` typed dictionaries + `LangToggle` ✅                |
| 7 | README with run instructions and the frame rate measured with 500 items placed, and on what hardware                                     | This file — [Quick Start](#quick-start-run-it-locally) + [Benchmark](#benchmark-500-items-measured) ✅ |

All required core items are implemented. No "plus" items were attempted — the assessment allows picking none, and depth was prioritised over breadth.

## Benchmark (500 items, measured)

Measured with the dev-only header controls on **2026-10-19**, app in its normal editing state (all panels visible; the proximity rule evaluating 124,750 item pairs per layout change):

| Field                      | Value                                                            |
| -------------------------- | ---------------------------------------------------------------- |
| Items                      | 500 (mixed cabinet/motor/conveyor, random 90° rotations)         |
| **Average FPS (5 s)**      | **75.3**                                                         |
| Min / max FPS (1 s window) | 75.7 / 76.7                                                      |
| Draw calls                 | 1,002                                                            |
| Triangles                  | 67,950                                                           |
| Browser                    | Chrome 155.0.0.0 (Windows)                                       |
| GPU                        | Intel Iris Xe Graphics — ANGLE (Direct3D 11)                     |
| CPU cores                  | 8                                                                |
| Device pixel ratio         | 1.25                                                             |
| Measured at                | 2026-10-19T12:17:43Z                                             |

**Reproduce (~1 minute):**

1. `npm run dev`, open the app, reload for a fresh scene.
2. Click **Seed 500** — 500 items are placed as **one** history entry (a single **Undo** clears them all).
3. Click **Measure 5s** — FPS is sampled from `requestAnimationFrame` deltas; the header shows the summary and DevTools prints the full JSON report (FPS, draw calls, triangles, browser, GPU, cores, DPR, timestamp).

**Reading the numbers:** FPS is browser-reported frame deltas (not a profiler), so expect variance with power state and background load. The average tracks the display's refresh rate (~75 Hz, vsync-aligned) — the scene rendered every frame with headroom, no dropped frames at 500 items. Min/max come from complete one-second windows; the average also includes partial windows, which is why min can exceed it. The seeded scene is deliberately dense (roughly half the floor occupied, many sub-0.6 m pairs) so it stresses rendering, the O(n²) proximity check, the item list and the warnings panel at once. The Scene targets `dpr [1, 1.5]` — at DPR 1.25 the full buffer is used.

The benchmark budget in the scenario is 50+ fps at 1080p on integrated graphics for up to 2,000 items; this build's 500-item dense scene holds the display ceiling on the measured hardware. Known limitations for larger scenes are listed below.

## Architecture Notes

- **Single source of truth:** layout data (`LayoutItem[]` inside the store's undo/redo `History`) is the only place items exist. Three.js/R3F objects are pure renderers of that state — never application state.
- **Immutable edits:** every store action returns new arrays/objects; tests assert previous history states are not mutated.
- **Undo/redo:** snapshot-based (`src/store/history.ts`, pure + tested, capped at 100 entries). Continuous drags use a transform session (`beginTransform` → `previewItemPosition` → `endTransform`) so a whole drag becomes exactly one history entry; a click without movement creates none.
- **Pure logic separated from UI:** grid snapping/bounds, the proximity rule, BOM summarisation, i18n and history are pure functions/modules under `src/lib/` and `src/store/history.ts` with unit tests (`npm test`, 76 tests).
- **Consistent placement:** every position change (add, drag, panel edit, rotation) goes through one entry point — snap to 0.5 m grid, then clamp the footprint inside the 20 × 12 m floor. Equipment footprints are defined in 1 m multiples so clamped positions always remain grid-aligned.
- **Selection sync:** the list, properties panel, toolbar and 3D viewport all read/write the same `selectedId` in the store — selecting in any surface updates the others.
- **Live rule:** violation detection runs as a memoised pure function over the item array on every layout change; the same violation ids drive the red 3D highlights, the red dots in the item list, and the warnings panel messages (both names + measured distance).
- **Localisation:** English and Vietnamese live in one typed dictionary (`src/lib/i18n.ts`) — the Vietnamese record must cover every English key or TypeScript fails. The store holds the current `lang`; components get a bound translator via `useI18n()`. Equipment names in lists, warnings and the BOM are localised through the same keys.
- **Component boundaries:** `src/components/editor/` holds R3F scene components; `src/components/ui/` holds DOM panels; `src/lib/` holds pure domain logic; `src/dev/` holds dev-only benchmark tooling (seed generator, FPS sampler, hardware detection) guarded by `import.meta.env.DEV`.

## Assumptions & Limitations

- Equipment uses simple three.js primitives (explicitly allowed by the assessment) rather than glTF models, to spend the time budget on editor behaviour; no external assets means no asset licensing/source-citation surface.
- Proximity rule measures centre-to-centre distance **on the ground plane (x/z)**: items rest on the floor, so this keeps the rule independent of item height and consistent across equipment types. O(n²) pairwise check — fine at the assessed scale (hundreds of items); revisit if scenes grow to thousands.
- Selection (which item is active) is transient UI state and is **not** part of undo history: undoing a delete restores the item but does not re-select it.
- Locale-sensitive number formatting is out of scope for the toggle: distances and coordinates render with Latin digits and a decimal point in both languages (machine-translated strings, per the assessment).
- No backend, persistence, authentication, or collaboration (explicitly out of scope for Part B).
- Performance: 1,002 draw calls at 500 items comes from per-item meshes (no instancing) — the next optimisation lever if scenes approach the scenario's 2,000-item target would be `InstancedMesh` per equipment type plus frustum culling of off-screen items.

## AI Tooling

Stated as required by the assessment ("say in your README which tools you used and how"):

- **Tool:** [OpenCode](https://opencode.ai) — an AI coding agent in the terminal with file edit/search and shell access (Claude models for the early milestones; `opencode/mimo-v2.6-flash-free` for the final ones).
- **How, in one loop per milestone:** the candidate scoped each of the 7 milestones in short prompts (e.g. *"add the proximity rule with tests"*, *"migrate panels to i18n"*, *"commit and move to the next step"*). The agent then researched the relevant code, implemented the change, and ran the full gate set (`tsc -b`, `eslint`, `vitest`, `build`) before reporting back; commits happened only on the candidate's request, with the candidate reviewing the diff.
- **Division of responsibility:** the agent wrote the code and tests; the candidate directed design decisions (e.g. snapshot vs. command undo, drag-as-one-entry, EN/VI strategy), performed **all** manual browser testing, and ran the benchmark on their own hardware — the measured numbers in this README come from that run, not from the agent.
- **Review readiness:** every part of this codebase can be walked through in the design review, including the prompts behind each milestone.

## Confidentiality

The assessment brief is treated as confidential and is **not** part of this repository (gitignored), per the brief's instructions.
