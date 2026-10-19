# AI Learning OS

A single-user, Arabic-first (RTL) web app that tracks a 37-week AI-engineering roadmap
(2026-10-20 → 2027-07-05) — tasks, study sessions, skills, projects, and resources — with
all progress stored locally in the browser. No backend, no accounts, no external services.

## Quick start

Requirements: Node.js 20.9+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The interface defaults to Arabic (RTL); switch to English from
Settings (الإعدادات ← اللغة).

| Script                 | Purpose                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| `npm run dev`          | Development server (Turbopack)                                        |
| `npm run build`        | Production build; `npm start` serves it                               |
| `npm test`             | Vitest suite (domain math, dates, storage, state, i18n parity, seed)  |
| `npm run lint`         | ESLint                                                                |
| `npm run typecheck`    | `next typegen` + `tsc --noEmit`                                       |

## How progress is calculated

- **Eligible tasks** = all tasks whose status is not `skipped`.
- **Task progress** = done / eligible (0% when eligible = 0; integer percent, rounded).
- **Week progress** = same, over that week's tasks. A week counts as _completed_ when all
  its eligible tasks are done and it has ≥1 eligible task.
- **Phase progress** = same, over all tasks of the phase's weeks. Phase status is derived
  from those tasks.
- **Overall roadmap progress** = done / eligible across all 37 weeks (task-based; no phase
  weighting, to avoid double counting).
- **Study time** = sum of logged session `minutes` only (never estimates). Today/week/7-day
  totals and a per-week activity series come from sessions alone.
- **Mastery** = explicit per-skill assessment (0–5 + evidence), never derived from
  tasks/weeks.

## Architecture map

```
src/
  app/                  routes: / (dashboard), /roadmap[/[phaseId]], /week/[number],
                        /log, /skills, /projects[/[projectId]], /resources, /settings
  components/           feature views + shared ui/ primitives
  data/                 seed content: roadmap (8 phases · 37 weeks), resources, skills,
                        projects, seed user state
  domain/               pure logic: types, constants, dates (week math), progress,
                        validation (roadmap/session/due-date warnings)
  lib/i18n/             ar/en dictionaries — key parity enforced by tests
  lib/state/            reducer, provider (hydration + persistence), selectors
  lib/storage/          LearningRepository (types.ts) + localStorage & memory adapters,
                        Zod schema, export/import
tests/                  vitest suites mirroring src/ (domain, data, state, storage, i18n)
```

Roadmap content (phases, weeks, tasks, resources) is authored in code under `src/data/`
and versioned with the app; only _user_ state is persisted.

## Storage, backup & restore

- Storage key: `ai-learning-os.state.v1` (localStorage). Envelope:
  `{ version: 1, savedAt, state }`.
- If a saved payload is unreadable, the raw copy is preserved under the backup key
  `ai-learning-os.state.v1.corrupt` and the app continues from a fresh state (a banner
  explains this and links to Settings).
- If localStorage is unavailable, the app keeps working with an in-memory fallback and
  warns that progress lasts for the session only.
- **Export**: Settings → «تصدير JSON» downloads `ai-learning-os-backup-YYYY-MM-DD.json`.
- **Import**: Settings → paste or choose a backup file → «مراجعة الاستيراد» → review the
  summary (tasks · sessions · skills + date span) → confirm. Import replaces all current
  progress; invalid files are rejected with a typed error and existing data is untouched.
- **Reset**: Settings → typed-word confirmation (إعادة / reset) wipes user progress and
  reseeds.

## Roadmap editing

- Settings → start date shifts every week unless that week has a manual date override;
  the computed roadmap end is shown, and the target end warns when it is earlier than the
  computed end.
- Week pages carry a per-week date override; overrides that create gaps or overlaps
  produce inline warnings (one issue per boundary).
- Study sessions and project due dates outside the roadmap period are flagged in the
  relevant views.

## Theming & language

Dark navy theme by default, with light and system options. Arabic RTL by default with an
English (LTR) toggle. Both dictionaries must carry the same keys (a test enforces parity).

## Replacing local storage with a backend (Supabase)

Persistence sits behind a small seam: `LearningRepository { kind, load, save, reset }` in
`src/lib/storage/types.ts`. The provider (`src/lib/state/provider.tsx`) selects the
localStorage adapter, falls back to memory, and exposes storage status to the UI. To move
to Supabase, implement the same interface (map `load`/`save`/`reset` onto a table row) and
swap the adapter where the provider creates it — the reducer, selectors, and every view
stay unchanged. Export/import and the recovery banner keep working because they rely only
on the envelope shape.
