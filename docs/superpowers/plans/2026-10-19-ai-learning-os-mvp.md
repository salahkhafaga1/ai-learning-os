# AI Learning OS — MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-user, Arabic-RTL learning tracker for a 37-week AI-engineering roadmap (2026-10-20 → 2027-07-05) with local persistence, evidence-based skill tracking, and safe JSON backup.

**Architecture:** Next.js App Router app. Pure domain modules (`domain/`) hold types, date math, progress math, and validators; static roadmap seed lives in `data/`; a `LearningRepository` interface hides localStorage behind adapters; a single client `AppStateProvider` (reducer + context) hydrates persisted state, renders all data views, and debounced-saves every change. Server components own routes, metadata, and static-route validation; interactive views are client components.

**Tech Stack:** Next.js (App Router, latest via `create-next-app`), TypeScript strict, Tailwind CSS v4, Lucide icons, Zod, Vitest + jsdom.

**Spec:** `docs/superpowers/specs/2026-10-19-ai-learning-os-design.md` (read alongside this plan; decisions D1–D14 bind).

## Global Constraints

- Work inside `C:\Users\USER\Documents\Default Project\ai-learning-os\` only; never modify sibling workspace files (`agent/`, `frames/`, `PRODUCT.md`, videos, `.claude/`).
- Windows PowerShell blocks `npm.ps1`: **always use `npm.cmd` / `npx.cmd`**.
- Arabic RTL is the default product experience: `<html lang="ar" dir="rtl">`; all user-visible chrome strings come from the i18n dictionary (no hardcoded UI text in components); digits are Latin (`-u-nu-latn`).
- No backend, database, auth, external AI API, analytics, or paid service. Runtime deps limited to: `next`, `react`, `react-dom`, `lucide-react`, `zod`. Dev deps: scaffold default + `vitest`, `jsdom`.
- Seed data must contain **zero** completed tasks and **zero** study minutes; "AI Business Copilot" is `status: 'proposed'`, `isSeedExample: true`.
- TypeScript strict; no `any`; no non-null assertions (`!`) without an explaining comment.
- Progress rules are exactly: eligible = status ≠ `skipped`; percent = `round(done/eligible*100)`, `0` when eligible = 0; overall = task-based across all 37 weeks; study time = sum of logged minutes only; mastery = explicit assessment only (level 5 requires non-empty evidence).
- localStorage key `ai-learning-os.state.v1`; corrupt payload backup key `ai-learning-os.state.v1.corrupt`; envelope `{ version: 1, savedAt, state }`.
- Every task ends with a passing `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd test` (once tests exist) and a commit (Conventional Commits).
- All 10 owner-supplied URLs stay in the seed; verify each returns HTTP 200 with `webfetch` before relying on it; replace only if broken, with an official alternative, and record the change.

## Review Focus

1. Corrupted/hostile localStorage payload at startup (truncated JSON, hand-edited, wrong version) → app must boot into a `recovered` state with the raw payload backed up and a visible warning, never crash. Test in T15/T16.
2. Importing JSON from a different app or a future schema version → typed rejection, existing data byte-identical. Test in T17.
3. Date boundaries: first day (2026-10-20), last day (2027-07-05), day after target, month/year/DST-crossing arithmetic → correct week numbers, overdue flags, no off-by-one. Tests in T4/T5.
4. Denominator zero states: week with zero eligible tasks, all-skipped week, brand-new store → no NaN/Infinity, every page shows a useful empty state. Tests in T5 + manual checks T24/T35.
5. Storage write failure mid-session (quota exceeded, storage disabled, private mode) → failure surfaced as a persistent banner, app keeps working in memory, no data-corrupting retries. Test in T16 + UI T35.

---

## Milestone 0 — Foundation

### Task 1: Scaffold, tooling, git

**Files:**
- Create: `ai-learning-os/` (whole scaffold), `vitest.config.ts`, modify `package.json` (scripts)

**Interfaces:**
- Produces: project root with scripts `dev`, `build`, `lint`, `typecheck`, `test`; `@/*` → `src/*` path alias in both TS and Vitest.

- [ ] Run from workspace root: `npx.cmd create-next-app@latest ai-learning-os --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes` (accept new prompts with `--yes` defaults; record installed Next/React/Tailwind versions).
- [ ] `git init` inside `ai-learning-os/`; if `git config user.name/email` are unset, stop and ask the owner for the identity to use.
- [ ] Install deps: `npm.cmd i zod lucide-react` then `npm.cmd i -D vitest jsdom`.
- [ ] Add scripts: `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, `"test:watch": "vitest"`.
- [ ] Create `vitest.config.ts`: `environment: 'jsdom'`, `include: ['tests/**/*.test.ts']`, alias `@` → `./src`.
- [ ] Verify: `npm.cmd run lint`, `npm.cmd run typecheck`, `npx.cmd vitest run --passWithNoTests`, `npm.cmd run build` all exit 0.
- [ ] First commit: `chore: scaffold Next.js app with TypeScript, Tailwind, Vitest`.

**Acceptance:** dev server renders the scaffold page; all four commands pass; repo has one commit.

### Task 2: Theme tokens, fonts, RTL root layout

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx` (temporary placeholder)

**Interfaces:**
- Produces: CSS variables per theme (`--app-bg`, `--app-surface`, `--app-surface-2`, `--app-border`, `--app-text`, `--app-text-2`, `--app-muted`, `--app-accent`, `--app-accent-hover`, `--app-success`, `--app-warning`, `--app-danger`), toggled by `:root[data-theme='dark'|'light']`, mapped through Tailwind v4 `@theme inline` to utilities (`bg-app`, `bg-surface`, `border-app`, `text-app`, …); font variables `--font-arabic` (IBM Plex Sans Arabic 400–700) and `--font-mono` (JetBrains Mono 400/500) via `next/font/google`.

- [ ] Write `globals.css`: dark values `bg #0A1220 / surface #0F1A2E / surface-2 #14213A / border #22304D / text #E6EDF7 / text-2 #A8B6CF / muted #7386A6 / accent #4C8DFF / success #3FB68B / warning #E5A54B / danger #E5606B`; light theme equivalents on white/gray; `color-scheme` per theme; base `line-height: 1.7` for Arabic; `prefers-reduced-motion` global guard.
- [ ] Wire `next/font/google` in `layout.tsx` with `variable` names; `<html lang="ar" dir="rtl" data-theme="dark">`; Arabic `metadata` title/description.
- [ ] Temporary `page.tsx`: centered card proving tokens/typography (heading, muted text, accent button, mono digits) — replaced in T24.
- [ ] Verify: `npm.cmd run build` passes; `npm.cmd run dev` shows RTL heading with Arabic font.
- [ ] Commit: `feat: dark/light theme tokens, Arabic fonts, RTL root layout`.

**Acceptance:** dark navy default, Arabic typography renders RTL, tokens switch by editing `data-theme`.

## Milestone 1 — Domain logic (TDD)

### Task 3: Domain types and constants

**Files:**
- Create: `src/domain/types.ts`, `src/domain/constants.ts`
- Test: `tests/domain/types.test.ts`

**Interfaces:**
- Produces (verbatim contract for all later tasks):

```ts
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done' | 'skipped';
export type TaskKind = 'study' | 'exercise' | 'project' | 'deliverable' | 'review';
export type ActivityType = 'reading' | 'coding' | 'debugging' | 'project' | 'review';
export type ResourceStatus = 'not_started' | 'in_progress' | 'completed';
export type ResourceKind = 'official_docs' | 'course' | 'tutorial' | 'article' | 'book' | 'video' | 'repo' | 'tool';
export type PhaseStatus = 'not_started' | 'in_progress' | 'blocked' | 'completed';
export type ProjectStatus = 'proposed' | 'planned' | 'in_progress' | 'paused' | 'completed';
export type ThemePref = 'dark' | 'light' | 'system';
export type LangPref = 'ar' | 'en';

export interface Task { id: string; weekNumber: number; title: string; kind: TaskKind; effortMinutes: number; resourceIds: string[] }
export interface Week { number: number; phaseId: string; title: string; objectives: string[]; topics: string[]; exercises: string[]; deliverables: string[]; masteryCriteria: string[]; tasks: Task[]; resourceIds: string[] }
export interface Phase { id: string; number: number; title: string; shortTitle: string; description: string; objectives: string[]; weekNumbers: number[] }
export interface Roadmap { phases: Phase[]; weeks: Week[] }
export interface Resource { id: string; title: string; url: string; kind: ResourceKind; official: boolean; phaseIds: string[]; weekNumbers: number[]; description: string }
export interface Skill { id: string; name: string; description: string }
export interface ProjectMilestone { id: string; title: string; done: boolean; dueDate?: string }
export interface ProjectTask { id: string; title: string; status: TaskStatus; dueDate?: string }
export interface Project { id: string; name: string; tagline: string; businessProblem: string; targetUsers: string; technologies: string[]; repoUrl?: string; status: ProjectStatus; milestones: ProjectMilestone[]; tasks: ProjectTask[]; evaluation: string; limitations: string[]; deliverables: string[]; isSeedExample: boolean }
export interface StudySession { id: string; date: string; topic: string; minutes: number; activity: ActivityType; learned: string; implemented: string; questions: string; createdAt: string }
export interface WeekReview { whatWentWell: string; whatWasHard: string; adjustments: string; rating: 1 | 2 | 3 | 4 | 5 | null; updatedAt: string }
export interface SkillAssessment { level: 0 | 1 | 2 | 3 | 4 | 5; evidence: string; notes: string; nextGoal: string; updatedAt: string }
export interface ResourceUserState { status: ResourceStatus; notes: string; updatedAt: string }
export interface Settings { roadmapStart: string; roadmapTargetEnd: string; theme: ThemePref; language: LangPref }
export interface AppState {
  schemaVersion: 1;
  taskStatus: Record<string, TaskStatus>;
  weekNotes: Record<string, string>;
  weekBlockers: Record<string, string>;
  weekDateOverrides: Record<string, string>;
  reviews: Record<string, WeekReview>;
  sessions: StudySession[];
  skillAssessments: Record<string, SkillAssessment>;
  projects: Project[];
  resourceStatus: Record<string, ResourceUserState>;
  settings: Settings;
}
```

- [ ] `constants.ts`: `WEEK_COUNT = 37`, `DAYS_PER_WEEK = 7`, `ROADMAP_DEFAULT_START = '2026-10-20'`, `ROADMAP_DEFAULT_TARGET_END = '2027-07-05'`, `STORAGE_KEY`, `CORRUPT_BACKUP_KEY`, activity/status label-key maps typed `Record<ActivityType, string>` etc.
- [ ] Test (shape only): build a minimal valid `AppState` literal; assert constants (`WEEK_COUNT === 37`, default range diff = 258 days once T4 lands — defer the day-count assertion to T4).
- [ ] Run `npm.cmd test` → pass. Commit: `feat: domain types and constants`.

**Acceptance:** `npm.cmd run typecheck` and tests pass; every later task imports these exact names.

### Task 4: Date utilities

**Files:**
- Create: `src/domain/dates.ts`
- Test: `tests/domain/dates.test.ts`

**Interfaces:**
- Produces: `fromISODate(iso: string): Date` (local midnight, throws on invalid), `toISODate(d: Date): string`, `addDays(iso: string, days: number): string`, `diffDays(aISO: string, bISO: string): number` (b − a; implement via `Date.UTC` normalization so DST cannot skew it), `weekRange(weekNumber: number, startISO: string): { start: string; end: string }` (start = `addDays(startISO, 7*(n-1))`, end = start + 6), `effectiveWeekStart(weekNumber: number, settings: Settings, overrides: Record<string, string>): string`, `effectiveWeekRange(...): { start: string; end: string }`, `weekNumberFor(dateISO: string, startISO: string): number | null` (1…37 else null), `effectiveWeekFor(dateISO: string, weeks: Week[], settings: Settings, overrides: Record<string, string>): number | null` (first week whose effective range contains the date; overlaps resolve to the lower week number; gaps → null — decision D13), `currentWeekNumber(todayISO: string, weeks: Week[], settings: Settings, overrides: Record<string, string>): number` (containing week, else the first week whose effective start is after today, else 37), `isWithinRoadmap(dateISO: string, startISO: string, targetEndISO: string): boolean`, `formatDate(iso: string, lang: LangPref): string` (`Intl.DateTimeFormat(lang === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })`), `formatRange(startISO: string, endISO: string, lang: LangPref): string`, `todayISO(): string`.

- [ ] Fail-first tests covering:
  - `weekRange(1, '2026-10-20')` → `2026-10-20 … 2026-10-26`; `weekRange(37, …)` → starts `2027-06-29`, ends **`2027-07-05`**.
  - `weekNumberFor`: `2026-10-19` → null; `2026-10-20` → 1; `2026-10-26` → 1; `2026-10-27` → 2; `2027-07-05` → 37; `2027-07-06` → null.
  - `addDays` across month/year: `'2026-12-31' + 1 = '2027-01-01'`; `diffDays('2026-10-20','2027-07-05') = 258`.
  - `effectiveWeekStart` returns override when present, derived otherwise; `formatDate` output contains Latin digits (assert via `/\d/` and absence of Arabic-Indic range `[\u0660-\u0669]`).
  - `effectiveWeekFor`: a date inside an override-shifted week returns that week; a date inside a created gap → null; an overlap date → lower week number. `currentWeekNumber`: gap date → next week; before all weeks → 1; after all weeks → 37.
- [ ] Implement. Run tests → pass. Commit: `feat: date utilities with boundary tests`.

**Acceptance:** all boundary cases above green.

### Task 5: Progress math

**Files:**
- Create: `src/domain/progress.ts`
- Test: `tests/domain/progress.test.ts`

**Interfaces:**
- Produces: `interface ProgressCount { completed: number; eligible: number; percent: number }`; `taskProgress(taskIds: string[], status: Record<string, TaskStatus>): ProgressCount`; `weekTaskProgress(week: Week, status): ProgressCount`; `phaseTaskProgress(phase: Phase, weeks: Week[], status): ProgressCount`; `overallTaskProgress(roadmap: Roadmap, status): ProgressCount`; `completedWeekCount(roadmap: Roadmap, status): number` (week counts only when ≥1 eligible and all eligible done); `phaseStatusFor(phase: Phase, weeks: Week[], status): PhaseStatus` (D6 order-of-precedence); `overdueTasks(roadmap: Roadmap, status, settings: Settings, overrides: Record<string, string>, todayISO: string): Array<{ task: Task; weekNumber: number }>`.

- [ ] Fail-first tests: empty list → `{0,0,0}`; all skipped → `{0,0,0}`; partial mixed (2 done / 3 eligible) → `percent 67`; statuses default to `todo` when key absent; `completedWeekCount`: a week counts only when it has ≥1 eligible task and all eligible are done (skipped tasks never block completion); zero-eligible weeks excluded; `phaseStatusFor` precedence (all done → completed; any blocked (others not all done) → blocked; any in_progress/done → in_progress; else not_started); `overdueTasks` includes only tasks whose **effective** week end < today and status not `done`/`skipped`; override shifts overdue window.
- [ ] Implement. Run tests → pass. Commit: `feat: task-based progress math (eligibility-aware)`.

**Acceptance:** every listed case green; no NaN/Infinity anywhere.

### Task 6: Next-task recommendation

**Files:**
- Create: `src/domain/recommendation.ts`
- Test: `tests/domain/recommendation.test.ts`

**Interfaces:**
- Produces: `nextRecommendedTask(roadmap: Roadmap, status, settings: Settings, overrides, todayISO: string): { task: Task; week: Week; phase: Phase } | null` — resolves the starting week via `currentWeekNumber` (decision D13).

- [ ] Fail-first tests: before start → first task of week 1; mid-week-k with some done → first non-`done`/`skipped` task in week k (task order = authored order); week k fully done → first such task in week k+1; all weeks done → null; after target end → null; `blocked` tasks ARE recommended (blocker must be seen); an override that shifts the current week moves the recommendation to that week.
- [ ] Implement. Tests pass. Commit: `feat: next recommended task selector`.

### Task 7: Roadmap & log validation

**Files:**
- Create: `src/domain/validation.ts`
- Test: `tests/domain/validation.test.ts`

**Interfaces:**
- Produces: `type IssueSeverity = 'warning' | 'error'`; `interface RoadmapIssue { severity: IssueSeverity; scope: 'roadmap' | 'week' | 'session' | 'project-task'; ref?: string | number; messageKey: string; params?: Record<string, string | number> }` (messageKey looked up in the i18n dictionary — domain stays language-free); `validateRoadmap(roadmap: Roadmap, settings: Settings, overrides: Record<string, string>): RoadmapIssue[]`; `validateSessions(sessions: StudySession[], settings: Settings): RoadmapIssue[]`; `validateProjectTaskDates(projects: Project[], settings: Settings): RoadmapIssue[]`.

- [ ] Fail-first tests: weeks count/sequence errors (`error` severity) when numbers aren't 1…37 sequential; target before computed end → `warning: target_before_roadmap_end`; consecutive effective ranges not contiguous (override creates gap/overlap) → `weekDateConflict` with params; session on `2026-10-19` or `2027-07-06` → `session_outside_period`; project task due date outside period → `task_outside_period`.
- [ ] Implement. Tests pass. Commit: `feat: roadmap, session, and task date validation`.

## Milestone 2 — Seed data

> All week content is authored, never placeholder. Per-week requirements (checked by T8–T11 tests): ≥2 objectives, ≥3 topics, ≥3 tasks (effort 20–600 min) including ≥1 `exercise`-kind and ≥1 `deliverable`-kind task, ≥1 exercise, ≥1 deliverable, ≥2 mastery criteria, ≥1 resource id — all non-empty unique id strings, no `TODO`/`lorem`/`placeholder` text. Arabic prose with English technical terms (decision D3).

### Task 8: Phases 1–2 + seed integrity test

**Files:** Create `src/data/phases/bundle.ts` (`export interface PhaseBundle { phase: Phase; weeks: Week[] }`), `src/data/phases/phase-1-pytorch.ts`, `src/data/phases/phase-2-python-backend.ts`, `src/data/phases/index.ts`; Test: `tests/data/seed.test.ts`

**Interfaces:** Produces `phase1Bundle: PhaseBundle`, `phase2Bundle: PhaseBundle` (later phase files follow the same `PhaseBundle` shape); `allPhases: Phase[]`, `allWeeks: Week[]` aggregated in `index.ts`.

- [ ] Author Phase 1 (weeks 1–6, topics: tensors, autograd, backpropagation, neural nets, training loops, datasets, evaluation, regularization, CNNs, transfer learning) and Phase 2 (weeks 7–10: modules, OOP, type hints, testing, Git, debugging, HTTP, FastAPI, SQL, PostgreSQL).
- [ ] Write `tests/data/seed.test.ts` that iterates over whatever `allWeeks` currently contains and asserts the per-week requirements + unique ids + `week.phaseId` resolves + `weekNumbers` contiguous from 1 (including the ≥1 `exercise`-kind and ≥1 `deliverable`-kind assertions).
- [ ] Run tests → pass. Commit: `feat: roadmap seed phase 1 (PyTorch) and phase 2 (Python/backend)`.

**Acceptance:** structural test green for authored weeks; no placeholder text.

### Task 9: Phases 3–4

**Files:** Create `src/data/phases/phase-3-nextjs.ts`, `phase-4-llm-rag.ts`; modify `index.ts`

- [ ] Author Phase 3 (weeks 11–14: App Router, Server/Client Components, forms, API integration, database integration, loading/error states) and Phase 4 (weeks 15–19: tokenization, embeddings, Transformers, attention, inference, prompting, vector search, RAG, hallucinations, evaluation). Include HF LLM-course resources in task `resourceIds`.
- [ ] Extend test iteration (no new assertions needed — same invariants). Tests pass. Commit: `feat: roadmap seed phases 3-4 (Next.js, LLM/RAG)`.

### Task 10: Phases 5–6

**Files:** Create `phase-5-agentic.ts`, `phase-6-mlops.ts`; modify `index.ts`

- [ ] Author Phase 5 (weeks 20–23: agents vs workflows, tools, state, tool calling, error handling, orchestration, permissions, evaluation; HF Agents-course resources) and Phase 6 (weeks 24–27: experiment tracking, reproducibility, model versioning, MLflow, Docker, CI, logging, monitoring; MLflow/Docker resources).
- [ ] Tests pass. Commit: `feat: roadmap seed phases 5-6 (agentic AI, MLOps)`.

### Task 11: Phases 7–8 + full-roadmap assertions

**Files:** Create `phase-7-embedded-iot.ts`, `phase-8-integration-portfolio.ts`; modify `index.ts`, `tests/data/seed.test.ts`

- [ ] Author Phase 7 (weeks 28–31: microcontrollers, sensors, communication, HTTP/MQTT concepts, data ingestion, edge vs cloud inference; ESP32 Arduino resource) and Phase 8 (weeks 32–37: business problem, architecture, AI pipeline, backend, frontend, testing, evaluation, deployment, documentation, portfolio presentation).
- [ ] Add final assertions: exactly **8** phases, **37** weeks, numbers `1…37` sequential covering all phases, every phase `weekNumbers` non-empty and matching, every phase has ≥2 objectives.
- [ ] Tests pass. Commit: `feat: roadmap seed phases 7-8; full 37-week integrity checks`.

**Acceptance (spec criterion 2):** 37/37 weeks meaningful; integrity test enforces it.

### Task 12: Resource library + URL verification

**Files:** Create `src/data/resources.ts`; Test: extend `tests/data/seed.test.ts`; Create `docs/superpowers/verification/urls-2026-10-19.md`

**Interfaces:** Produces `resources: Resource[]`, `resourceById: Record<string, Resource>`.

- [ ] Seed the 10 owner URLs verbatim with `official: true`: `pytorch-basics` → https://docs.pytorch.org/tutorials/beginner/basics/intro.html (official_docs, P1), `python-tutorial` → https://docs.python.org/3/tutorial/ (official_docs, P2), `fastapi-tutorial` → https://fastapi.tiangolo.com/tutorial/ (official_docs, P2), `postgresql-tutorial` → https://www.postgresql.org/docs/17/tutorial.html (official_docs, P2), `nextjs-docs` → https://nextjs.org/docs/app (official_docs, P3), `hf-llm-course` → https://huggingface.co/learn/llm-course/en/chapter1/1 (course, P4), `hf-agents-course` → https://huggingface.co/learn/agents-course/en/unit1/introduction (course, P5), `mlflow` → https://mlflow.org/docs/latest/ml/ (official_docs, P6), `docker-get-started` → https://docs.docker.com/get-started/ (official_docs, P6), `esp32-arduino` → https://github.com/espressif/arduino-esp32 (repo, P7). Add only official/vendor-docs extras where a week needs it (allowed sources: docs.pytest.org, developer.mozilla.org, mqtt.org, scikit-learn.org, docs.docker.com) — e.g. pytest, MDN HTTP, MQTT, scikit-learn model evaluation.
- [ ] Map `phaseIds`/`weekNumbers`; ensure every week in the seed gets ≥1 `resourceIds` entry and every resource is referenced ≥1 time (assert both in tests).
- [ ] Verify every URL with `webfetch`; record URL + HTTP status in `docs/superpowers/verification/urls-2026-10-19.md`. Any non-200: replace with the correct official URL on the same site, note the change in the report.
- [ ] Tests pass. Commit: `feat: verified official resource library mapped to weeks`.

**Acceptance:** 10/10 owner URLs verified (or documented replacements); resource refs bijective.

### Task 13: Skills, projects seed, `createSeedState`

**Files:** Create `src/data/skills.ts`, `src/data/projects.ts`, `src/data/seed.ts`; Test: `tests/data/seed-state.test.ts`

**Interfaces:**
- Produces: `skills: Skill[]` (11 ids: `python-engineering`, `machine-learning`, `deep-learning-pytorch`, `apis-backend`, `sql-databases`, `nextjs-typescript`, `llms-transformers`, `rag-evaluation`, `agentic-ai`, `mlops-deployment`, `embedded-iot`); `seedProjects: Project[]` (exactly one: `ai-business-copilot`); `createSeedState(overrides?: Partial<Pick<Settings, 'roadmapStart' | 'roadmapTargetEnd' | 'theme' | 'language'>>): AppState`; `defaultAssessment(): SkillAssessment`.

- [ ] Author skills (Arabic names + English term, one-line description). Author AI Business Copilot: `status: 'proposed'`, `isSeedExample: true`, business problem (SMEs wanting AI over their own business data), target users, technologies (Next.js, FastAPI, PostgreSQL, RAG, embeddings…), 4 milestones, 6 tasks all `todo`, `evaluation: ''`, limitations include "مشروع مقترح للتعلم — لم يُبنَ بعد", deliverables, no `repoUrl`.
- [ ] `createSeedState`: all roadmap tasks `todo`; sessions `[]`; notes/blockers/overrides/reviews `{}`; every skill → level 0, empty text; every resource → `not_started`; settings default `2026-10-20 → 2027-07-05, dark, ar`; deep-copy projects so state never aliases module data.
- [ ] Tests: zero `done` statuses; sessions empty; total logged minutes = 0; project `status === 'proposed'`; two calls deep-equal; mutating the returned state does not affect `seedProjects`.
- [ ] Commit: `feat: skills, seeded proposed project, seed state factory`.

## Milestone 3 — Persistence

### Task 14: Repository interface + memory adapter

**Files:** Create `src/lib/storage/types.ts`, `src/lib/storage/memory.ts`; Test: `tests/storage/memory.test.ts`

**Interfaces:**

```ts
export type LoadWarningCode = 'malformed_backup' | 'incompatible_version' | 'storage_unavailable' | 'write_failed';
export type LoadStatus = 'fresh' | 'loaded' | 'recovered';
export interface LoadResult { status: LoadStatus; state: AppState; warning?: LoadWarningCode }
export type SaveResult = { ok: true } | { ok: false; code: LoadWarningCode };
export interface LearningRepository { readonly kind: 'local' | 'memory'; load(): LoadResult; save(state: AppState): SaveResult; reset(): void }
```

- [ ] Tests: fresh repo → `fresh` + seed equal to `createSeedState()`; save→load roundtrip → `loaded`; reset → `fresh`.
- [ ] Implement. Pass. Commit: `feat: storage repository interface and memory adapter`.

### Task 15: Zod schemas (load-path validation)

**Files:** Create `src/lib/storage/schema.ts`; Test: `tests/storage/schema.test.ts`

**Interfaces:** Produces `stateSchema` (strict field types, non-negative ints, enum checks, `minutes` int 1…1440, `rating` `1|2|3|4|5|null`, ISO `YYYY-MM-DD` string checks), `envelopeSchema` (`{ version: 1, savedAt: string, state }`), `parseEnvelope(json: unknown): { ok: true; state: AppState } | { ok: false; code: 'invalid_shape' | 'unsupported_version' }` (unknown extra keys are stripped, not rejected). The localStorage adapter (T16) calls this on every load (decision D12).

- [ ] Fail-first tests: valid envelope → ok; missing `settings` → `invalid_shape`; `version: 0` → `unsupported_version`; `minutes: -5` / `'60'` → reject; extra unknown keys → accepted+stripped; `taskStatus` unknown value → reject; huge-but-valid notes string → accept.
- [ ] Implement. Pass. Commit: `feat: zod schemas for state envelope validation`.

### Task 16: localStorage adapter

**Files:** Create `src/lib/storage/local-storage.ts`; Test: `tests/storage/local-storage.test.ts`

**Interfaces:** Produces `createLocalStorageRepository(storage?: Storage): LearningRepository` (validates every load with `parseEnvelope` from T15; maps `unsupported_version` → `incompatible_version`, `invalid_shape` and JSON parse errors → `malformed_backup`); `isStorageAvailable(): boolean`.

- [ ] Fail-first tests (jsdom): roundtrip; malformed JSON in `ai-learning-os.state.v1` → `recovered`, fresh state, raw payload preserved under `ai-learning-os.state.v1.corrupt`, original key cleared; **hand-edited valid JSON with the wrong shape** → same `malformed_backup` recovery path; envelope with `version: 2` → `recovered` + `incompatible_version`; `setItem` throwing (quota) → `{ ok: false, code: 'write_failed' }` and repo keeps serving last good state; storage entirely unavailable → caller can fall back to memory (test `isStorageAvailable` with a throwing getter).
- [ ] Implement. Pass. Commit: `feat: localStorage adapter with corruption recovery and quota guards`.

### Task 17: Export / import

**Files:** Create `src/lib/storage/export-import.ts`; Test: `tests/storage/export-import.test.ts`

**Interfaces:** Produces `buildExport(state: AppState): { json: string; fileName: string }` (fileName `ai-learning-os-backup-YYYY-MM-DD.json`, pretty-printed, `app: 'ai-learning-os'`); `parseImport(text: string): { ok: true; state: AppState; summary: ImportSummary } | { ok: false; code: 'invalid_json' | 'not_our_app' | 'invalid_shape' | 'unsupported_version' }`; `interface ImportSummary { tasksWithStatus: number; sessions: number; sessionDateRange: string | null; skillsAssessed: number }` (used in the confirmation dialog; computed before any write).

- [ ] Fail-first tests: full roundtrip `buildExport`→`parseImport` deep-equals state; `'{oops'` → `invalid_json`; `{}` → `not_our_app`/`invalid_shape`; newer version → `unsupported_version`; summary counts correct; parseImport **never** mutates storage.
- [ ] Implement. Pass. Commit: `feat: safe JSON export and validated import`.

## Milestone 4 — App shell and state

### Task 18: Reducer

**Files:** Create `src/lib/state/reducer.ts`, `src/lib/state/actions.ts`; Test: `tests/state/reducer.test.ts`

**Interfaces:**

```ts
export type Action =
  | { type: 'data/load'; state: AppState }
  | { type: 'data/import'; state: AppState }
  | { type: 'data/reset' }
  | { type: 'task/setStatus'; taskId: string; status: TaskStatus }
  | { type: 'week/setNote'; weekNumber: number; text: string }
  | { type: 'week/setBlocker'; weekNumber: number; text: string }
  | { type: 'week/setDateOverride'; weekNumber: number; startISO: string | null }
  | { type: 'week/saveReview'; weekNumber: number; review: WeekReview }
  | { type: 'session/add'; session: StudySession }
  | { type: 'session/update'; session: StudySession }
  | { type: 'session/delete'; id: string }
  | { type: 'skill/setAssessment'; skillId: string; assessment: SkillAssessment }
  | { type: 'project/add'; project: Project }
  | { type: 'project/update'; project: Project }
  | { type: 'project/delete'; projectId: string }
  | { type: 'resource/setState'; resourceId: string; value: ResourceUserState }
  | { type: 'settings/patch'; patch: Partial<Settings> };

export function reducer(state: AppState, action: Action): AppState; // pure; unknown ids are no-ops
```

- [ ] Fail-first tests: each action’s happy path; `task/setStatus` with unknown taskId → same reference; `week/setDateOverride` with `null` deletes the key; `skill/setAssessment` with `level: 5` and blank evidence → state unchanged (mastery guard); level outside 0…5 or non-integer → unchanged; `data/reset` → deep-equal `createSeedState()`; `data/import` replaces everything; reducer never mutates its input (deep-freeze input in tests).
- [ ] Implement. Pass. Commit: `feat: app state reducer with mastery guard`.

### Task 19: Client state provider + persistence

**Files:** Create `src/lib/state/provider.tsx`; modify `src/app/layout.tsx` (wrap children); Test: none (covered by T14–T18; manual checks in T36)

**Interfaces:** Produces `AppStateProvider({ children })` (client): chooses `createLocalStorageRepository(window.localStorage)` when `isStorageAvailable()` else memory + `storage_unavailable` warning; hydrates on mount via `dispatch({ type: 'data/load', state: load().state })`; exposes `useAppState(): { state: AppState; hydration: 'loading' | 'ready'; loadWarning?: LoadWarningCode; writeFailed: boolean }`, `useAppDispatch()`, and `useResetProgress()`; debounced save (250 ms) on state change after ready; sets `data-theme` (resolving `system` via `matchMedia`) after ready. **Mount order (definitive):** `<AppStateProvider><I18nProvider>{children}</I18nProvider></AppStateProvider>` — `I18nProvider` (T20) reads `useAppState`, so it must be nested inside this provider.

- [ ] Implement; wire into root layout inside the RTL html shell.
- [ ] Verify: `npm.cmd run build`; dev: toggle a value (temporary dev button or via console dispatch) → refresh → value persists (full QA in T36).
- [ ] Commit: `feat: client state provider with debounced local persistence`.

### Task 20: i18n dictionary and provider

**Files:** Create `src/lib/i18n/ar.ts`, `src/lib/i18n/en.ts`, `src/lib/i18n/index.tsx`; modify `src/app/layout.tsx` (mount `I18nProvider` inside `AppStateProvider`); Test: `tests/i18n/dictionary.test.ts`

**Interfaces:** Produces `type Dict = typeof ar`; `ar: Dict`, `en: Dict`; `I18nProvider({ children }: { children: ReactNode })` (client; reads `settings.language` from app state via `useAppState`, applies `document.documentElement.lang/dir` in an effect); `useT(): { t: (key: keyof Dict, params?: Record<string, string | number>) => string; lang: LangPref }` with `{param}` interpolation.

- [ ] Test (node-side, no React): flatten both dictionaries; assert identical key sets; assert every `ar` and `en` value is non-empty; assert no key contains untranslated `TODO`.
- [ ] Author dictionary keys for: nav, common actions (save/edit/delete/cancel/confirm/close/add/search), statuses, activity types, resource kinds/statuses, skill level labels (0–5), phase/week labels, dashboard widgets, log/skills/projects/resources/settings pages, dialogs incl. reset typing word, all warning/error/empty-state messages, and validation `messageKey`s from T7.
- [ ] Commit: `feat: Arabic/English UI dictionary and i18n provider`.

### Task 21: UI primitives

**Files:** Create `src/components/ui/`: `cn.ts`, `button.tsx`, `icon-button.tsx`, `card.tsx`, `badge.tsx`, `progress-bar.tsx`, `stat.tsx`, `field.tsx` (Label/Input/Textarea/Select/HelpText), `dialog.tsx`, `tabs.tsx`, `segmented-control.tsx`, `empty-state.tsx`, `skeleton.tsx`, `page-header.tsx`, `external-link.tsx`

**Interfaces:** Produces the primitives consumed by every page task: `Button({variant: 'primary'|'secondary'|'ghost'|'danger', size: 'sm'|'md'})`; `IconButton({label: string, icon})` (label → `aria-label`); `Card`, `CardHeader`; `Badge({tone: 'neutral'|'success'|'warning'|'danger'|'accent'})`; `ProgressBar({value: number, max: number, label?: string})`; `Stat({label, value, hint?, icon?})`; `Field` set; `Dialog({open, onClose, title, children, actions?})` built on native `<dialog>` (`showModal`, ESC + backdrop close); `Tabs`; `SegmentedControl<T>({options: {value: T; label: string}[], value, onChange})`; `EmptyState({icon, title, body, action?})`; `Skeleton`; `PageHeader({title, subtitle?, actions?})`; `ExternalLink({href, children})` (`target="_blank" rel="noopener noreferrer"`).

- [ ] Implement with logical Tailwind properties (`ms-`/`me-`/`ps-`/`pe-`/`text-start`) so RTL needs no mirrored classes.
- [ ] Verify: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build` pass.
- [ ] Commit: `feat: reusable UI primitives (RTL-safe, accessible)`.

### Task 22: App shell, route skeletons, error/loading/404

**Files:** Create `src/components/layout/app-shell.tsx`, `sidebar-nav.tsx`, `top-bar.tsx`, `mobile-nav.tsx`, `src/app/error.tsx`, `src/app/loading.tsx`, `src/app/not-found.tsx`; Create empty route pages as placeholders: `src/app/roadmap/page.tsx`, `src/app/roadmap/[phaseId]/page.tsx`, `src/app/week/[number]/page.tsx`, `src/app/log/page.tsx`, `src/app/skills/page.tsx`, `src/app/projects/page.tsx`, `src/app/projects/[projectId]/page.tsx`, `src/app/resources/page.tsx`, `src/app/settings/page.tsx`

**Interfaces:** Consumes `useAppState` + selector stubs; Produces `AppShell({ children })` (sidebar ≥ `lg`, top bar with app name + current-week chip + overall %, hamburger drawer < `lg`); every route file exports `metadata` and renders `<PageHeader>` + placeholder body (real content lands T24–T33); `[phaseId]`/`[number]` are server-validated against the static seed with `notFound()`; `[projectId]` renders a client shell — user-created projects live only in local storage, so resolution and the in-app not-found state happen in the client view (T31).

- [ ] Implement shell + placeholders; nav items with Lucide icons (LayoutDashboard, Map, NotebookPen, Target, FolderKanban, Library, Settings).
- [ ] Verify build + navigate all 10 routes in dev (RTL, mobile drawer at 375 px).
- [ ] Commit: `feat: RTL app shell, navigation, and route skeletons`.

## Milestone 5 — Dashboard

### Task 23: Selectors

**Files:** Create `src/lib/state/selectors.ts`; Test: `tests/state/selectors.test.ts`

**Interfaces:**

```ts
export interface DashboardModel {
  overall: ProgressCount;
  weeks: { completed: number; total: number };
  phases: Array<{ phase: Phase; status: PhaseStatus; progress: ProgressCount; range: { start: string; end: string } }>;
  current: { week: Week; phase: Phase; range: { start: string; end: string } } | null;
  taskCounts: { done: number; pending: number; blocked: number };
  time: { totalMinutes: number; todayMinutes: number; thisWeekMinutes: number; last7DaysMinutes: number };
  activityByWeek: Array<{ weekNumber: number | null; minutes: number; label: string }>; // weeks (currentWeekNumber−7 … currentWeekNumber clipped 1…37, override-aware); sessions classified by effectiveWeekFor — gap/outside dates group under weekNumber null; buckets kept only when minutes > 0
  overdue: Array<{ task: Task; weekNumber: number }>;
  blocked: Array<{ task: Task; weekNumber: number; note?: string }>;
  next: { task: Task; week: Week; phase: Phase } | null;
  milestones: Array<{ task: Task; week: Week; weekEnd: string }>; // next 3 not-done 'deliverable' tasks by week end
  issues: RoadmapIssue[];
}
export function selectDashboard(roadmap: Roadmap, state: AppState, todayISO: string): DashboardModel;
export function sessionsToday(sessions: StudySession[], todayISO: string): StudySession[]; // + sessionsInRange(sessions, startISO, endISO), sumMinutes(sessions)
```

- [ ] Fail-first tests: totals from sessions only (today / effective-week / 7-day / all-time); empty state zeros; activityByWeek bucket boundaries (session on week-1 start lands week 1; on `2027-07-06` lands `null`; `current` follows `currentWeekNumber` when an override shifts the current week); milestones ordering + exclusion of done; overdue count parity with `overdueTasks`; blocked aggregation lists week blockers and blocked tasks.
- [ ] Implement. Pass. Commit: `feat: dashboard and page selectors`.

### Task 24: Dashboard page

**Files:** Modify `src/app/page.tsx`; Create `src/components/dashboard/dashboard-view.tsx`, `stat-grid.tsx`, `current-focus-card.tsx`, `weekly-activity-chart.tsx`, `blockers-panel.tsx`, `overdue-panel.tsx`, `milestones-panel.tsx`, `next-task-card.tsx`

- [ ] Implement all widgets from `selectDashboard`; CSS-bar chart (no chart lib) with minutes tooltips + empty message; fresh-state onboarding card ("لا توجد جلسات بعد — ابدأ بتسجيل أول جلسة") linking `/log` and current week; zero-fabricated-data guarantee: render only selector output.
- [ ] Verify dev: fresh state shows overall 0%, weeks 0/37, 0 دقيقة, empty chart, no fake data anywhere; complete a task → numbers move.
- [ ] Commit: `feat: dashboard with real-data widgets and empty states`.

## Milestone 6 — Roadmap, phase, week pages

### Task 25: Roadmap page

**Files:** Modify `src/app/roadmap/page.tsx`; Create `src/components/roadmap/roadmap-view.tsx`, `phase-card.tsx`, `issues-banner.tsx`

- [ ] Phase cards: number, Arabic title + English short title, derived date range, status badge, progress bar, week count, objectives preview, link to `/roadmap/[phaseId]`. Issues banner renders `validateRoadmap` + `validateSessions` messages via dictionary keys with params (no issues → nothing).
- [ ] Commit: `feat: roadmap overview page with phase cards and schedule warnings`.

### Task 26: Phase detail page

**Files:** Modify `src/app/roadmap/[phaseId]/page.tsx`; Create `src/components/roadmap/phase-view.tsx`, `week-row.tsx`

- [ ] Objectives list, weeks table (number, title, effective range, tasks done/total, status chip, link), scoped warnings, prev/next phase links; `notFound()` on unknown id (404 page from T22).
- [ ] Commit: `feat: phase detail page with weekly breakdown`.

### Task 27: Week page — tasks, topics, mastery

**Files:** Modify `src/app/week/[number]/page.tsx`; Create `src/components/week/week-view.tsx`, `task-row.tsx`, `status-control.tsx`, `resource-chips.tsx`

- [ ] Header (week n, phase link, effective range, progress, derived status, prev/next); topics chips; objectives; **mastery criteria list** (acceptance criterion 6); exercises; deliverables; resources (official badge + external links). `TaskRow`: checkbox quick-toggle `done⇄todo` + status control (`todo/in_progress/blocked/done/skipped`) + effort + linked resources + overdue badge; disabled-aware for skipped. Zero-eligible week → explicit "لا مهام مؤهلة" note.
- [ ] Verify: toggling updates dashboard counts after navigation; reload persists.
- [ ] Commit: `feat: week page with task tracking and mastery criteria`.

### Task 28: Week page — notes, blockers, review, date override

**Files:** Create `src/components/week/week-notes.tsx`, `review-form.tsx`, `date-override-control.tsx`; modify `week-view.tsx`

- [ ] Notes textarea (autosave on blur → `week/setNote`), blocker field (`week/setBlocker`), review form (4 fields + 1–5 rating → `week/saveReview`, shows `updatedAt`), date override (date input + "إعادة للافتراضي" → `week/setDateOverride`), per-week conflict badge fed by T7 validator.
- [ ] Commit: `feat: week notes, blockers, review, and date overrides`.

## Milestone 7 — Study log

### Task 29: Study log page

**Files:** Modify `src/app/log/page.tsx`; Create `src/components/log/log-view.tsx`, `session-form.tsx`, `session-card.tsx`, `totals-strip.tsx`

- [ ] Form (date default today, topic, minutes validated 1–1440, activity select per `ActivityType`, learned/implemented/questions) → `session/add`, inline success message, form reset. List: grouped by day desc, day totals, per-session edit (dialog) / delete with confirm; filters: text search + activity; totals strip (today / this week / all time) from selectors; warning banner listing sessions outside the roadmap period; empty state.
- [ ] Verify: log two sessions → totals and dashboard chart update; refresh keeps them.
- [ ] Commit: `feat: daily study log with totals and filters`.

## Milestone 8 — Skills, projects, resources

### Task 30: Skills tracker page

**Files:** Modify `src/app/skills/page.tsx`; Create `src/components/skills/skills-view.tsx`, `skill-card.tsx`

- [ ] 11 skill cards: level `SegmentedControl` 0–5 (Arabic labels: لم يبدأ/أساسيات/أتدرب/شبه مستقل/مستقل/متقن بأدلة), evidence textarea, notes, next-goal input, save → `skill/setAssessment`, shows `updatedAt`; level 5 option disabled with hint until evidence non-empty (mirrors reducer guard); summary strip (counts per level); banner explaining mastery is evidence-based and never automatic.
- [ ] Commit: `feat: evidence-based skills tracker`.

### Task 31: Projects tracker

**Files:** Modify `src/app/projects/page.tsx`, `src/app/projects/[projectId]/page.tsx`; Create `src/components/projects/projects-view.tsx`, `project-card.tsx`, `project-detail-view.tsx`, `project-form-dialog.tsx`

- [ ] List: cards with status badge (proposed → "مقترح" + explanation), progress from project tasks, tech chips, repo external link if present, "إضافة مشروع" dialog. Detail: full fields, edit via dialog, milestones checklist with due dates, tasks with status control + due date (warn when outside roadmap period), evaluation/limitations/deliverables editors, delete with confirm (seed project deletable but warning shown). AI Business Copilot renders the explicit "proposed learning project — not built" label (acceptance criterion 7). Unknown/deleted project ids resolve to the in-app not-found state (no server 404 — see T22).
- [ ] Commit: `feat: project tracker with seeded proposed copilot project`.

### Task 32: Resource library page

**Files:** Modify `src/app/resources/page.tsx`; Create `src/components/resources/resources-view.tsx`, `resource-card.tsx`

- [ ] Search (title/description/topic), filters (phase, kind, status), cards: title, description, kind badge, official badge, phase/week deep-links, external link, status segmented control + notes autosave (`resource/setState`), count summary, empty state for no matches. Verify all seed URLs clickable.
- [ ] Commit: `feat: searchable resource library with learning status`.

## Milestone 9 — Settings and data management

### Task 33: Settings page

**Files:** Modify `src/app/settings/page.tsx`; Create `src/components/settings/settings-view.tsx`, `schedule-section.tsx`, `appearance-section.tsx`, `data-section.tsx`, `import-dialog.tsx`, `reset-dialog.tsx`

- [ ] Schedule: start date input + target end input → `settings/patch`; show computed end (`weekRange(37, start).end`) and warn when target < computed; explanatory note that changing start shifts all weeks.
- [ ] Appearance: theme + language segmented controls.
- [ ] Data: export button (`buildExport` → Blob download); import via file picker or paste → `parseImport` → errors shown inline (typed dictionary messages) → confirmation dialog with summary counts → `data/import` only on confirm; reset → dialog requiring typed `RESET` → `data/reset` + repository.reset; storage backend indicator (محلي/ذاكرة مؤقتة) + persistence explanation card documenting the progress method (acceptance criteria 8 + "documented method").
- [ ] Verify: export → reset → import roundtrip restores tasks/sessions/notes exactly (full QA in T36).
- [ ] Commit: `feat: settings with schedule, appearance, export/import/reset`.

## Milestone 10 — Hardening and acceptance

### Task 34: Accessibility, RTL, responsiveness pass

**Files:** Touch whatever fails; no new features.

- [ ] Keyboard pass: tab order through shell, forms, dialogs (ESC + focus return), status controls; `aria-label` on all icon-only buttons; focus-visible ring token.
- [ ] Contrast check text/background pairs both themes (body text ≥ 4.5:1); fix muted tokens if needed.
- [ ] Breakpoints 375 / 768 / 1280 px: sidebar→drawer, no horizontal scroll, tables→cards, chart labels legible.
- [ ] RTL details: prev/next chevrons point correctly, numbers Latin digits, long Arabic text wraps; paste 2 000-char note → layout intact.
- [ ] `prefers-reduced-motion` respected (transitions collapse).
- [ ] Commit: `fix: accessibility, RTL, and responsive refinements`.

### Task 35: States, docs, and graceful degradation

**Files:** Create `README.md`; modify banners where needed.

- [ ] Persistent banners: `loadWarning === 'malformed_backup'`/`'incompatible_version'` (with backup-key note + link to settings), `storage_unavailable` (memory mode: "لن يتم حفظ التقدم بعد إغلاق التبويب"), `writeFailed` (save failures). `error.tsx` reset works; `not-found.tsx` styled.
- [ ] Empty states audit: dashboard, log, skills (all level 0), projects (seed only), resources (search miss), week (zero eligible).
- [ ] `README.md`: purpose, setup (`npm.cmd install`, `dev/build/lint/typecheck/test`), architecture map, progress method (verbatim §7 of the spec), storage keys + backup/restore steps, roadmap editing notes, future Supabase adapter note.
- [ ] Commit: `docs: README and graceful storage/error states`.

### Task 36: Final verification

**Files:** Create `docs/qa/mvp-checklist.md` (recorded results).

- [ ] Run and paste results: `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build` — all must pass.
- [ ] Manual QA script, recorded with pass/fail: (1) fresh load → dashboard zeros + empty states; (2) complete tasks + note + blocker in week 1 → reload → persisted; (3) log 2 sessions → daily/weekly totals exact; (4) export → reset (typed) → import → everything restored; (5) close and reopen the browser → data intact; (6) AR RTL correct on all 10 routes; (7) EN toggle switches chrome + LTR; (8) mastery requires evidence; (9) week 37 accessible with content; (10) no console errors.
- [ ] Map each owner acceptance criterion (1–10) to its evidence in the checklist.
- [ ] Final commit + summary report to the owner.

**Acceptance:** all checks green; checklist file committed; no known critical runtime errors.
