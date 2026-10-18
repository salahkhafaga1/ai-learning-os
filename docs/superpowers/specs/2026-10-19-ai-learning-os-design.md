# AI Learning OS — Design Document

**Date:** 2026-10-19
**Status:** Draft for approval
**Source spec:** Product brief supplied by the owner (roadmap 2026-10-20 → 2027-07-05, 8 phases, 37 weeks).

---

## 1. What this is and why

A personal, single-user learning tracker for an Arabic-speaking engineer following a 37-week
AI-engineering roadmap (start 2026-10-20, target 2027-07-05). It replaces a static plan with an
interactive tool: follow the weekly roadmap, log real study sessions, track tasks and blockers,
assess skills with evidence, manage projects and resources, and export/import all progress.

Success = the owner opens one dashboard each day, knows exactly what to study next, logs what
they actually did, and can prove skill growth with evidence — without any backend, account, or
paid service.

## 2. Users

Exactly one: the owner. No multi-user, roles, sharing, or sync in the MVP. All data is local
to the browser.

## 3. Goals / Non-goals / Anti-goals

**Goals**
- Seed the full 37-week roadmap with meaningful content (no placeholder weeks).
- Track tasks, notes, blockers, weekly reviews, study sessions, skills, projects, resources.
- Persist everything locally; survive refreshes and browser restarts.
- Safe JSON export/import and a guarded reset.
- Arabic RTL interface by default, with an interface-language toggle (AR/EN) if feasible.
- Transparent, testable progress math.

**Non-goals (MVP)**
- No backend, database, auth, cloud sync, AI API, or paid services.
- No content translation layer (see Decision D3).
- No notifications, reminders, calendar integration, or shareable links.
- No editing of roadmap *content* (topics/objectives); the *schedule* and all progress data are editable.

**Anti-goals (even if it technically works, this is a failure)**
- Fabricated progress: seed data must contain zero completed tasks and zero study minutes.
- A gamified, childish look; anything that pressures a fixed daily target or penalizes rest days.
- Silent data loss: any import/parse failure must never overwrite existing data.
- Skill "mastery" auto-awarded because a week is complete.

## 4. Hard constraints (from the owner's brief)

- Next.js App Router, TypeScript strict, Tailwind CSS, Lucide icons, accessible components.
- Local persistence behind a small abstraction that a future Supabase adapter can replace.
- React Server Components by default; Client Components only where interactivity requires.
- Dark navy + blue accents, developer-dashboard aesthetic, responsive, Arabic RTL first.
- Dependencies minimal; app runs with no API keys. Tests for progress math, date handling, storage.
- Exact roadmap: 8 phases / 37 weeks with the given topics, dates, and the 10 official resource URLs.

## 5. Decisions (owner should review; mine are marked "my call")

| # | Decision | Source |
|---|----------|--------|
| D1 | **Location**: new self-contained subproject `ai-learning-os/` inside this workspace; `git init` inside it; unrelated workspace files untouched. | my call |
| D2 | **Stack versions**: whatever `create-next-app@latest` installs (Next 15/16, React 19, Tailwind v4), TypeScript strict. Zod for runtime validation, Vitest + jsdom for tests, Lucide for icons. No other runtime deps (no chart lib — charts are CSS bars; no date lib — small tested date utils). | my call |
| D3 | **Language strategy**: Arabic RTL is the product default and fully implemented (chrome, labels, empty states, messages). An AR/EN toggle switches *interface chrome* only. Roadmap seed content is authored once, in the owner's own mixed style: Arabic prose + English technical terms. Full bilingual content is a documented future pass, not MVP. | my call, flagged |
| D4 | **Week dates are derived**: week *n* spans `roadmapStart + 7(n−1)` … `+6 days` (37 weeks → last day = start + 258 = 2027-07-05, matching the brief exactly). Phase ranges derive from their weeks. A per-week **date override** (start date) is supported and persisted; the validator then flags gaps/overlaps/order conflicts and a target-end earlier than the computed roadmap end. This is how "schedule is editable" + "week date conflict warnings" are honored without a second source of truth. | my call |
| D5 | **Progress = task-based, eligibility-aware** (documented in §7 and in-app). Mastery is separate and evidence-gated. | owner constrained, my formalization |
| D6 | **Phase status is derived** from its tasks: any `blocked` → Blocked; else all done → Completed; else any `in_progress`/`done` → In Progress; else Not Started. No manual override in MVP (prevents inconsistent states). | my call |
| D7 | **Mastery guard**: skill level "mastered" (5) is only stored when evidence text is present; the app never sets levels automatically. | owner constrained, my formalization |
| D8 | **Storage envelope**: single localStorage key `ai-learning-os.state.v1` containing `{version, savedAt, state}`; Zod-validated on load and import. Malformed/incompatible payloads are copied to a backup key and reported, never silently dropped. If localStorage is unavailable (private mode), an in-memory repository is used and a warning is shown. | my call |
| D9 | **Themes**: dark (default) + light via CSS variables and `data-theme`; "system" follows `prefers-color-scheme`. | owner asked for theme prefs |
| D10 | **Test scope**: unit tests for domain math (progress, dates, recommendations, validation), storage repository, schemas, export/import, reducer, and i18n dictionary parity. No React Testing Library in MVP (keeps deps minimal); UI verified via lint/typecheck/build plus a manual QA checklist. | my call |
| D11 | **Seed example project**: "AI Business Copilot" is seeded with `status: 'proposed'` and `isSeedExample: true`, rendered with an explicit "proposed learning project — not built yet" label. | owner constrained |
| D12 | **Load-path validation lives in the storage adapter**: `load()` calls the Zod `parseEnvelope` on every read; bad JSON or `invalid_shape` → `malformed_backup`; `unsupported_version` → `incompatible_version`. Both copy the raw payload to the backup key and return a fresh state. | my call |
| D13 | **Date→week mapping with overrides**: `effectiveWeekFor(date)` = first week whose effective range contains the date (overlaps resolve to the lower week number); dates in gaps → null (classified "خارج الفترة"). The dashboard/top-bar focus week uses `currentWeekNumber(...)`: containing week, else the next week starting after today, else week 37. Override-free `weekNumberFor` is used only for the 37-block period math. | my call |
| D14 | **Deliverable tasks**: every seeded week includes ≥1 `kind: 'deliverable'` task (enforced by the seed integrity test) so the dashboard milestones panel always has real data; `Week.deliverables` strings describe those tasks' acceptance. | owner constrained, formalized |

## 6. Data model (TypeScript, `src/domain/types.ts`)

- `TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done' | 'skipped'`
- `ActivityType = 'reading' | 'coding' | 'debugging' | 'project' | 'review'`
- `Task { id, weekNumber, title, kind: 'study'|'exercise'|'project'|'review', effortMinutes, resourceIds[] }`
- `Week { number, phaseId, title, objectives[], topics[], exercises[], deliverables[], masteryCriteria[], tasks[], resourceIds[] }`
- `Phase { id, number, title, shortTitle, description, objectives[], weekNumbers[] }`
- `Resource { id, title, url, kind, official, phaseIds[], weekNumbers[], description }`
- `Skill { id, name, description }` — 11 skills per the brief
- `Project { id, name, tagline, businessProblem, targetUsers, technologies[], repoUrl?, status, milestones[], tasks[], evaluation?, limitations[], deliverables[], isSeedExample }`
- Persistent `AppState`: `{ schemaVersion: 1, taskStatus, weekNotes, weekBlockers, weekDateOverrides, reviews, sessions[], skillAssessments, projects[], resourceStatus, settings }`
- `StudySession { id, date, topic, minutes, activity, learned, implemented, questions, createdAt }`
- `Settings { roadmapStart, roadmapTargetEnd, theme, language }`

Static roadmap data lives in `src/data/` (`phases/phase-1..8.ts`, `resources.ts`, `skills.ts`,
`projects.ts`, `seed.ts`). User progress lives only in `AppState`.

## 7. Progress calculation (the documented method)

- **Eligible tasks** = all tasks whose status is not `skipped`.
- **Task progress** = done / eligible (0% when eligible = 0; integer percent, rounded).
- **Week progress** = same, over that week's tasks. A week counts as *completed* when all its
  eligible tasks are done and it has ≥1 eligible task.
- **Phase progress** = same, over all tasks of the phase's weeks. Phase status is derived (D6).
- **Overall roadmap progress** = done / eligible across all 37 weeks (task-based; no phase
  weighting, to avoid double counting).
- **Study time** = sum of logged session `minutes` only (never estimates). Today/week/7-day totals
  and a per-week activity series come from sessions alone.
- **Mastery** = explicit per-skill assessment (0–5 + evidence), never derived from tasks/weeks.

## 8. Storage, import/export, recovery

- `LearningRepository { kind, load(): LoadResult, save(state): SaveResult, reset() }`.
  Adapters: `localStorage` (browser) and `memory` (fallback). Provider hydrates on mount,
  renders skeletons while loading, saves on change (debounced), surfaces write failures.
- `load()` → `{ status: 'fresh' | 'loaded' | 'recovered', state, warning? }`; `recovered` means a
  bad payload was backed up and a fresh state returned.
- **Export**: `{ app: 'ai-learning-os', version: 1, exportedAt, state }` → pretty JSON download.
- **Import**: parse → Zod-validate → version check → show summary (counts + date span) → explicit
  confirmation → replace state. Failure returns a typed error; existing data untouched.
- **Reset**: confirmation dialog (typed "RESET") → clears keys, reseeds.

## 9. Warnings (spec requirement)

Pure `validateRoadmap()` returns issues with i18n message keys (domain stays language-free):
target end earlier than computed end; week date gaps/overlaps/order conflicts (only possible via
overrides); study sessions dated outside the roadmap period; project task due dates outside the
period. Rendered as a roadmap banner + per-week/per-item badges.

## 10. Interface map (App Router)

`/` dashboard · `/roadmap` · `/roadmap/[phaseId]` · `/week/[number]` · `/log` · `/skills` ·
`/projects` · `/projects/[projectId]` · `/resources` · `/settings` · `not-found` + `error` +
`loading`. Server page files own metadata; `/roadmap/[phaseId]` and `/week/[number]` are
server-validated against static seed data with `notFound()`; `/projects/[projectId]` resolves
inside the client view (user-created projects exist only in local storage) and shows an in-app
not-found state. Interactive views are client components fed by the state provider.

## 11. Visual direction

Dark navy `#0A1220` base, surfaces `#0F1A2E`/`#14213A`, borders `#22304D`, accent blue `#4C8DFF`,
muted status colors (success/warn/danger). Light theme via variables. IBM Plex Sans Arabic
(400–700) + JetBrains Mono for numerals/code, both via `next/font`. Latin digits everywhere via
`Intl` with `-u-nu-latn`. Cards, restrained 1px borders, 10px radii, 150 ms transitions,
`prefers-reduced-motion` honored.

## 12. Acceptance criteria mapping (owner's 10)

1 Dashboard from seed → T23–T24. 2 All 37 weeks meaningful → T8–T11 + integrity test. 3 Tasks,
notes, blockers → T27. 4 Study log + accurate totals → T29. 5 Persistence → T14–T16
(repo/schema/adapter) + T19 (provider). 6 Mastery visible per week → T27 section + seed.
7 Projects + resources → T31/T32. 8 Export/import safe → T15/T17/T33. 9 Arabic RTL → T2 + T20 +
manual QA. 10 Checks pass, no critical errors → T36.

## 13. Open questions for the owner (resolve at approval)

1. **Q1 Location & git**: OK to create `ai-learning-os/` here with its own git repo?
2. **Q2 Content language**: accept D3 (Arabic chrome + AR/EN toggle; seed content authored once in
   mixed AR/EN technical style)? Or do you want fully bilingual seed content (larger build)?
3. **Q3 Seed content review**: approve structure-first (you'll read all 37 weeks inside the built
   app), or do you want the week-content draft listed for review before implementation?
4. **Q4 Per-week date overrides (D4)**: keep this feature, or simplify to start/target dates only
   (then conflict warnings cover only target mismatch + out-of-period sessions)?
