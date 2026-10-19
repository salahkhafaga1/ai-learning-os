# MVP acceptance checklist — AI Learning OS

**Recorded:** 2026-10-19
**Tree:** `3c29338` (T35) — code frozen during QA; this file is the only T36 change.
**Environment:** Next.js 16.4.2 dev server (Turbopack), automated Chromium (viewport ≈ 912 px). Storage started fresh (both `ai-learning-os.state.v1` keys removed). Every state mutation was made **through the UI**; storage was only read, never hand-written.

## Automated checks

| Check              | Command                | Result                                        |
| ------------------ | ---------------------- | --------------------------------------------- |
| Tests              | `npm test`             | **164 passed** (14 files)                     |
| Lint               | `npm run lint`         | clean                                         |
| Types              | `npm run typecheck`    | clean (`next typegen` + `tsc --noEmit`)       |
| Production build   | `npm run build`        | **58/58** pages generated (all routes static) |

## T36 manual QA script (plan task 36) — 10/10 PASS

1. **Fresh load → dashboard zeros + empty states — PASS.**
   Dashboard shows `0%`, `0 من 157`, `0 من 37`, `0 دقيقة`; hero empty copy «لم تُسجَّل أي جلسة دراسة بعد…»; theme `dark`.
   Log page shows «لا جلسات بعد» + «سجّل أول جلسة لتبدأ تتبع وقتك الحقيقي.»
   (Projects/resources/skills empty and search-miss states were exercised in T30–T32 QA; the zero-eligible week state in T35 QA.)

2. **Complete task + note + blocker in week 1 → reload → persisted — PASS.**
   Quick-toggle on `w1-t1` → storage `taskStatus["w1-t1"]="done"`; notes «ملاحظة قبول T36» and blocker «عائق قبول T36» blur-saved to `weekNotes["1"]` / `weekBlockers["1"]`.
   After a full page reload: checkbox checked, both textareas populated.

3. **Log 2 sessions → daily/weekly totals exact — PASS.**
   Session A 30 min (default date 2026-10-19) + session B 15 min (date 2026-10-20) stored as such.
   Dashboard: total **«45 دقيقة»**, «اليوم: 30 دقيقة», «هذا الأسبوع: 15 دقيقة» — i.e. today = 30 and roadmap-week 1 = 15, each exact. Task side moved to «1 من 157» + «1%».

4. **Export → reset (typed) → import → everything restored — PASS.**
   Export payload (≈10 KB) carries all mutations: `{app:"ai-learning-os", version:1}` with `sessions`, `taskStatus`, `weekNotes`, `weekBlockers`, `skillAssessments` (level 5), `projects`, `resourceStatus`, `settings`.
   Reset dialog: confirm stays disabled until the word «إعادة» is typed → confirm resets storage to seed (`w1-t1` back to `todo`, sessions empty).
   Import: paste exported JSON → review dialog «تأكيد الاستيراد» shows «المهام: 157 · الجلسات: 1 · المهارات المقيمة: 1» → confirm → flash «تم الاستيراد بنجاح» → storage byte-level restored (session 30 min, task done, skill level 5).
   (Invalid-file error codes were verified in T33 QA.)

5. **Close and reopen the browser → data intact — PASS.**
   Tab closed, fresh tab opened: dashboard still «1 من 157» + all three study totals; week 1 checkbox, note, and blocker all intact.

6. **AR RTL correct on all 10 routes — PASS.**

   | Route                          | dir | lang | Content sample (Arabic)               |
   | ------------------------------ | --- | ---- | ------------------------------------- |
   | `/`                            | rtl | ar   | «لوحة التحكم …»                       |
   | `/roadmap`                     | rtl | ar   | «خريطة الطريق — 37 أسبوعًا · 8 …»    |
   | `/roadmap/phase-1`             | rtl | ar   | «أساسيات التعلم العميق مع PyTor…»     |
   | `/week/1`                      | rtl | ar   | «الأسبوع 1 — التنسورات وأساسيات …»   |
   | `/log`                         | rtl | ar   | «سجل الدراسة …»                       |
   | `/skills`                      | rtl | ar   | «المهارات — إحدى عشرة مهارة …»       |
   | `/projects`                    | rtl | ar   | «المشاريع …»                          |
   | `/projects/ai-business-copilot`| rtl | ar   | «مساعد الأعمال الذكي (AI Busine…»     |
   | `/resources`                   | rtl | ar   | «المصادر — مصادر رسمية موثوقة …»     |
   | `/settings`                    | rtl | ar   | «الإعدادات — نافذة المخطط الزمني …»  |

7. **EN toggle switches chrome + LTR — PASS.**
   Language control → `html lang="en" dir="ltr"`, chrome labels flip (theme/language options render as «Dark/Light/System» + «Arabic/English», `English:true`). Switching back → `ar` / `rtl`.

8. **Mastery requires evidence — PASS.**
   Level-5 option is disabled with empty evidence; clicking it leaves the assessment at level 0. After entering evidence «دليل قبول T36» the option activates, and save stores `level: 5` + evidence.

9. **Week 37 accessible with content — PASS.**
   `/week/37` renders «الأسبوع 37 — التوثيق والمحفظة», phase 8 · Portfolio, dates 2027-06-29 → 2027-07-05, 5 tasks, notes/blocker/review sections and the week's skill chips. `/week/19` renders similarly.

10. **No console errors — PASS.** Zero console errors collected across every navigation in the whole pass.

## Owner acceptance criteria (design §12) → evidence

1. **Dashboard accuracy** — T36 Q1/Q3: seed shows exact zeros; one task + two sessions move the dashboard to exactly 1/157, 1%, 45/30/15 minutes (never estimates).
2. **All 37 weeks meaningful** — seed integrity suite (`tests/data/seed.test.ts`), build generates all 37 week pages, browser spot-checks of weeks 1/19/37 with real content; T8–T11 QA.
3. **Tasks, notes, blockers** — T36 Q2 (live edit + reload persistence); T27 QA.
4. **Study log + accurate totals** — T36 Q3 exact daily/weekly/total split; T29 QA.
5. **Persistence** — T36 Q5 (close/reopen); T33/T35 QA incl. corrupt-payload recovery and memory-fallback warnings.
6. **Mastery visible** — T36 Q8 evidence gate + level save; skill assessment states surface on cards and week pages; T30 QA.
7. **Projects + resources** — T36 Q6 route sweep; T31/T32 QA (statuses, milestones, filters, 14 sources).
8. **Export/import safe** — T36 Q4 full roundtrip incl. typed-reset gate and review counts; T33 QA error codes (`invalid_json`, `not_our_app`, `invalid_shape`, `unsupported_version`).
9. **Arabic RTL** — T36 Q6 (10/10 routes) + Q7 EN toggle; T34 keyboard/focus/contrast pass; Lighthouse a11y = 1.0 in both themes.
10. **Checks pass, no critical errors** — this page: 164 tests, lint, typecheck, build all green; 0 console errors in T36; T34 Lighthouse accessibility/best-practices/SEO = 1.0/1.0/1.0.

## Non-blocking notes

- A session dated **before** the roadmap start (QA used 2026-10-19; roadmap starts 2026-10-20) still counts in the total and “today”, and appears in the activity chart's “outside weeks” bucket — by design (documented method, §7 of the design spec).
- At 912 px the sidebar collapses below the `lg` breakpoint into the drawer; UI-language evidence is therefore `html lang/dir` + chrome labels rather than a visible sidebar label.
- The write-failure banner, corrupt-backup note + settings link, in-app 404, and no-eligible-week states were exercised in T35 QA (see the execution ledger `progress.md`).
- No open blockers were found. Known future work is only the storage-adapter swap (Supabase) documented in `README.md`.
