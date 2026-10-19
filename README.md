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
  lib/storage/          LearningRepository (types.ts) + localStorage, memory & Supabase
                        adapters, Zod schema, export/import
tests/                  vitest suites mirroring src/ (domain, data, state, storage, i18n)
```

Roadmap content (phases, weeks, tasks, resources) is authored in code under `src/data/`
and versioned with the app; only _user_ state is persisted.

## Storage, backup & restore

- **Supabase mode (default when configured)**: with the env vars below set, the single
  `learning_state` row in Supabase is the source of truth and localStorage becomes an
  offline mirror: on first run any existing local progress is migrated up automatically;
  an unreachable cloud falls back to the mirror with a warning; failed uploads still keep
  the change locally.
- Storage key: `ai-learning-os.state.v1` (localStorage — the primary store in local mode,
  the mirror in Supabase mode). Envelope: `{ version: 1, savedAt, state }`.
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

## Supabase storage

Persistence sits behind a small seam: `LearningRepository { kind, load, save, reset }` in
`src/lib/storage/types.ts`. The provider (`src/lib/state/provider.tsx`) picks the adapter:

1. **Supabase** — when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   are set.
2. **localStorage** — otherwise, when available.
3. **In-memory** — last resort, with a session-only warning.

To enable Supabase, create `.env.local` (gitignored) with your project's values:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

and create the table once in the Supabase SQL editor:

```sql
create table if not exists public.learning_state (
  id text primary key,
  envelope jsonb not null,
  saved_at timestamptz not null default now()
);

alter table public.learning_state enable row level security;

drop policy if exists "single user access" on public.learning_state;

create policy "single user access"
  on public.learning_state
  for all
  using (true)
  with check (true);
```

There is no auth by design (single-user app). The publishable key is safe to ship in the
client bundle, but with the policy above anyone holding the URL + key can read/write the
row — use a private project, or add auth before storing anything sensitive.

Behavior: the row (`id = 'default'`) holds the same `{ version, savedAt, state }` envelope
as local storage. On load, an empty cloud migrates the local mirror up; an unreachable
cloud serves the mirror with a `remote_unavailable` warning; a malformed or newer-version
payload is preserved under the corrupt backup key and recovered like local mode. The
reducer, selectors, and every view stay unchanged, and export/import keeps working because
it relies only on the envelope shape.
