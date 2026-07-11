# DRAVIK Phase 1 — Repository Reorganization: Execution Backlog

> Status: Ready for execution · Date: 2026-06-10
> **Living phase status & roadmap:** [docs/planning/phases.md](./phases.md) (single source of truth for sequencing + current state).
> Source of truth for *what* we build: [implementation-spec.md](../architecture/implementation-spec.md) (§1, §2, §16, §17).
> This document is the *how and when* for the re-org. No architecture decisions are made here.
>
> **Phase 1 scope guardrails (hard):** preserve all existing functionality · keep all mock data ·
> keep all current routes working (redirects allowed) · no database code · no authentication ·
> no API · no behavior changes. Every PR in this phase is a file move, a config change, or a
> mechanical import rewrite — nothing else.

**Assumed capacity:** one engineer (+ Claude Code). Estimates are person-days. With a second
engineer, E6/E7 parallelize and the phase compresses from ~3 weeks to ~2.

---

## Epic list

| Epic | Name | Effort | Depends on | Maps to spec tasks |
|---|---|---|---|---|
| E1 | Rails: toolchain, hygiene, CI | 1 d | — | T1, T2 |
| E2 | Characterization test suite | 2.5 d | E1 | T3 |
| E3 | Monorepo scaffold (pnpm + Turborepo, app → `apps/command-center`) | 1 d | E2 | T4 |
| E4 | Extract `packages/shared` + `packages/ui` | 1 d | E3 | T5 |
| E5 | `packages/contracts` + boundary lint (warn) + `packages/crm` template extraction | 2.5 d | E4 | T6, T7 |
| E6 | Extract `packages/realty` + `packages/lending` | 2 d | E5 | T8 (part) |
| E7 | Extract `packages/marketing`, `referrals`, `broker`, `portal`; boundary lint → error | 3 d | E6 | T8 (rest) |
| E8 | Route namespacing + redirects | 1 d | E7 | T9 |
| E9 | Module manifests + static registry | 1 d | E7 | T10 |

Total: **~15 person-days** including slack. Natural pause point: after **E6** the repo matches the
approved minimal milestone path (workspace ✚ tests ✚ shared/ui ✚ crm/realty/lending); E7–E9
complete Phase 1 as specced.

**One sequencing note vs. the milestone sketch (workspace first, tests second):** tests come
first here deliberately. E3 is the single biggest file move of the phase; doing it before any
safety net exists means the riskiest change lands unverified. The characterization suite is
written against current URLs and survives the move untouched — so writing it first costs nothing
and converts E3 from "careful" to "mechanical." If you still prefer workspace-first, the only
change is swapping E2/E3; everything else holds.

---

## Task list

### E1 — Rails: toolchain, hygiene, CI (1 day)

| ID | Task | Est | Notes |
|---|---|---|---|
| E1.1 | Adopt pnpm now (single package): remove `package-lock.json`, `pnpm install`, commit `pnpm-lock.yaml`. Verify `pnpm dev` and `pnpm build` run. | 2 h | Adopting pnpm pre-workspace avoids churning CI twice. The dev script uses `next dev --webpack` — verify that mode specifically. |
| E1.2 | Resolve `agency-agents/` nested git repo: add to `.gitignore` (recommended) or relocate outside the repo. Record the decision in the PR description. | 1 h | It has its own `.git`; leaving it untracked-but-present confuses tooling. |
| E1.3 | CI workflow (`.github/workflows/ci.yml`): pnpm install (frozen lockfile) → `eslint` → `tsc --noEmit` → `next build`. Triggers: PR + push to main. | 2 h | |
| E1.4 | Branch protection on `main` (CI required + 1 review); tag `phase1-baseline` at the pre-reorg commit. | 0.5 h | The tag is the phase-wide rollback anchor. |

- **Validation:** CI green on a no-op PR; app runs locally via pnpm.
- **Rollback:** restore `package-lock.json` from the tag; delete workflow. Nothing else changed.
- **Risks:** pnpm's strict linking can surface phantom dependencies the npm layout tolerated.
  That's a feature — declare them; don't enable hoisting workarounds.

### E2 — Characterization test suite (2.5 days)

| ID | Task | Est | Notes |
|---|---|---|---|
| E2.1 | Playwright setup: config with `webServer` (`next build && next start`), CI job, single chromium project, fixed viewport. | 3 h | Run against the production build — it's what later phases deploy. |
| E2.2 | Route smoke specs ×14 (`/`→redirect, dashboard, leads, prospecting, referral-network, mapping, marketing, transactions, inbox, portal, reports, team, mortgage, settings, + one catch-all slug): page renders, primary heading/landmark visible, **zero console errors**, zero failed network requests. | 1 d | |
| E2.3 | Interaction specs: leads kanban drag + detail panel open/close; transactions + mortgage pipelines; pre-qual calculator input; inbox conversation select + composer; mapping filters + list view toggle (assert map *container* mounts — don't pixel-test Leaflet tiles); marketing tab switching; settings section nav; team agent panel; referral modal + split calculator; global search open + query; sidebar collapse; portal dashboard cards. | 1.25 d | |
| E2.4 | Flake-proofing: never assert exact `timeAgo` strings ("3d ago" drifts daily — assert element presence/pattern); no animation-timing waits; retries **off** locally so flake is visible, on(1) in CI. | 2 h | `timeAgo` runs off `Date.now()` against fixture dates — the #1 future flake source. |
| E2.5 | Add PR template with the Phase 1 checklist (see PR strategy) including "characterization suite green". | 1 h | |

- **Validation:** suite passes 3 consecutive full runs locally and once in CI.
- **Rollback:** tests are additive; delete the folder.
- **Risks:** over-specifying (asserting copy/styling that legitimate refactors never touch) makes
  the suite a nuisance instead of a net — assert behavior and structure, not pixels, except where
  noted.

### E3 — Monorepo scaffold (1 day)

| ID | Task | Est | Notes |
|---|---|---|---|
| E3.1 | Root scaffolding: `pnpm-workspace.yaml`, root `package.json` (scripts delegate to turbo), `turbo.json` with `lint`, `typecheck`, `build`, `test:e2e` pipelines. | 2 h | |
| E3.2 | `git mv` the app wholesale into `apps/command-center/` (src, public, next/postcss/eslint/ts configs, favicon). Rename package to `@dravik/command-center` (retires the `real-estate` name). | 2 h | **Pure-move commit, zero edits** — keeps `git log --follow` clean and review trivial. |
| E3.3 | Config fix-up commit: tsconfig paths, `outputFileTracingRoot`, Playwright `webServer` cwd, root `.gitignore`. | 2 h | Separate commit from the move, by policy. |
| E3.4 | CI switches to `turbo run lint typecheck build` + Playwright job. | 1 h | |

- **Validation:** `pnpm dev` and `pnpm build` from root; **E2 suite green**; `git log --follow`
  on a sampled moved file shows full history.
- **Rollback:** revert the squash-merge commit — moves revert cleanly.
- **Risks:** Turborepo cache returning stale builds (set sensible `outputs`); `--webpack` dev
  mode quirks under workspace layout — validate dev *and* prod build before merge.

### E4 — Extract `packages/shared` + `packages/ui` (1 day)

| ID | Task | Est | Notes |
|---|---|---|---|
| E4.1 | `packages/shared`: move `lib/utils.ts` (`cn`, `formatCurrency`, `formatCurrencyFull`, `timeAgo`). Codemod all `@/lib/utils` imports → `@dravik/shared` across ~80 files in the same PR. **No re-export shim** — shims linger and hide the dependency truth. | 3 h | Mechanical sed-able change; the codemod commit is separate from the move commit. |
| E4.2 | `packages/ui`: move `components/ui/RelativeTime`; extract the Tailwind 4 design tokens (the `@theme` custom properties in `globals.css` — gold/dravik-dark/surface palette) into `packages/ui/styles.css`, imported by the app's `globals.css`. Add `transpilePackages` to next config. | 3 h | Highest visual-risk task of the phase. |
| E4.3 | Manual visual sweep of all 14 routes side-by-side with the baseline + E2 green. | 1 h | |

- **Validation:** E2 green; visual sweep finds zero styling drift; boundary truth: `ui` depends
  only on `shared`.
- **Rollback:** revert PR.
- **Risks:** Tailwind 4's CSS-first config makes token extraction subtle (layer ordering, `@theme`
  scoping). Mitigation: the visual sweep is a *named task*, not an afterthought, and the tokens
  move in their own commit so a revert is surgical.

### E5 — Contracts + boundary lint (warn) + CRM template extraction (2.5 days)

| ID | Task | Est | Notes |
|---|---|---|---|
| E5.1 | Scaffold `packages/contracts` (types only, zero runtime deps). Move `types/{lead,communication,prospecting}.ts` into it under a per-module layout (`contracts/src/crm/…`). | 2 h | Other modules' types move with their own extraction PRs — not all at once. |
| E5.2 | Boundary lint in **warn mode**: dependency-cruiser (or eslint-plugin-boundaries) encoding spec §2 rules B1–B5; report printed in CI on every PR. | 3 h | Warn now, error in E7.5 — so in-flight extractions aren't blocked by each other. |
| E5.3 | `packages/crm`: `git mv` `components/{leads,inbox,prospecting}` → `crm/src/components`, page-level compositions → `crm/src/pages`, `data/{leads,communications,prospecting}.ts` → `crm/src/data`. Public `index.ts` exports pages **and fixtures** (temporary — see allowlist note below). | 1 d | |
| E5.4 | App route files become thin re-exports of `@dravik/crm` pages. `GlobalSearch` and `DashboardClient` (which live in command-center — composition there is legal per B2) switch their lead/communication imports to the crm public surface. | 3 h | |
| E5.5 | Write `docs/planning/extraction-recipe.md`: the exact step checklist this PR followed. E6/E7 PRs follow it verbatim. | 2 h | The template PR is the deliverable as much as the package is. |

**Temporary allowance (documented, with removal date):** packages export fixtures from `index.ts`
so command-center can compose cross-module views (dashboard KPIs, global search) without an API.
This is Phase-1-only scaffolding; spec Phase 3a replaces fixture exports with repository
interfaces, Phase 4 deletes fixtures. Track as an allowlist file in the boundary config so the
exceptions are enumerable, not ambient.

- **Validation:** E2 green (zero spec changes needed — URLs and behavior identical); boundary
  report shows no violations outside the allowlist; crm package builds in isolation
  (`turbo run typecheck --filter=@dravik/crm`).
- **Rollback:** revert PR(s).
- **Risks:** biggest moved-line-count PR of the phase. Mitigation: 3 separate PRs are acceptable
  (contracts+lint / crm move / consumer rewire) if review size becomes a problem.

### E6 — Extract `packages/realty` + `packages/lending` (2 days)

| ID | Task | Est | Notes |
|---|---|---|---|
| E6.1 | `packages/realty` per recipe: mapping + transactions components, `data/{properties,transactions}`, `types/{property,transaction}` → contracts. Keep Leaflet dynamic-import patterns exactly as-is. | 1 d | Marketing components (still living in the app tree at this point) that import `data/properties` switch to the realty public surface — legal, app-side. |
| E6.2 | `packages/lending` per recipe: mortgage components, `data/mortgage`, `types/mortgage` → contracts. `DashboardClient`/`GlobalSearch` rewired to public surfaces. | 0.75 d | |

- **Validation:** E2 green per PR; mapping spec specifically (Leaflet is the fragile one);
  boundary report clean.
- **Rollback:** revert per-package PR; packages are independent.
- **Risks:** Leaflet under `transpilePackages` + SSR — the dynamic imports must move untouched;
  the E2 mapping spec is the tripwire.

### E7 — Extract remaining packages; lint → error (3 days)

| ID | Task | Est | Notes |
|---|---|---|---|
| E7.1 | `packages/marketing` + the one real refactor of the phase: `PropertyPagePreview` takes `properties` as a **prop** instead of importing realty fixtures (B1 forbids marketing→realty). The thin app route reads `@dravik/realty`'s public fixtures and passes them down. Behavior identical; documented as the phase's only signature change. | 1 d | This is exactly the shape the future API composition will have — the prop seam is permanent, only its data source changes later. |
| E7.2 | `packages/referrals` per recipe (incl. `data/{agents,militaryBases}`, `types/referral`). | 0.5 d | |
| E7.3 | `packages/broker` per recipe (team + reports + settings; `types/{team,analytics,settings}`). | 0.75 d | Largest component count (20 files) but zero cross-module edges. |
| E7.4 | `packages/portal` per recipe (`data/client-portal`, `types/client-portal`). | 0.5 d | |
| E7.5 | Flip boundary lint **warn → error** in CI; allowlist contains only the fixture-export exceptions from E5, each annotated with its Phase-4 removal ticket. | 2 h | From this merge on, a B1–B5 violation cannot enter main. |

- **Validation:** E2 green per PR; after E7.5, an intentionally-violating test branch fails CI
  (verify the gate actually gates).
- **Rollback:** per-package PR reverts; E7.5 is one-line revert.
- **Risks:** four extractions in flight invite merge conflicts in shared files
  (`GlobalSearch`, route files). Mitigation: serialize merges (extraction PRs rebase on the
  previous merge), or with two engineers, partition consumers explicitly.

### E8 — Route namespacing + redirects (1 day)

| ID | Task | Est | Notes |
|---|---|---|---|
| E8.1 | Move route dirs to the spec §3 namespace: `/leads`→`/crm/leads`, `/inbox`→`/crm/inbox`, `/prospecting`→`/crm/prospecting`, `/mapping`→`/realty/mapping`, `/transactions`→`/realty/transactions`, `/mortgage`→`/lending`, `/referral-network`→`/referrals`, `/team`→`/broker/team`, `/reports`→`/broker/reports`, `/settings`→`/broker/settings`. `/portal`, `/marketing`, `/dashboard` unchanged. | 3 h | |
| E8.2 | Permanent redirects (`next.config` `redirects()`) from every old path; update `Sidebar` hrefs and `DashboardClient`/notification links. | 2 h | "Keep all current routes working" is satisfied via 308s — old URLs never 404. |
| E8.3 | Update E2 specs to new URLs **and add explicit redirect assertions** (old URL → 308 → new URL renders). | 2 h | The one place characterization specs legitimately change this phase — change them in the same PR, reviewed together. |

- **Validation:** full suite green incl. redirect specs; manual click-through of sidebar.
- **Rollback:** revert PR; redirects make this user-invisible in both directions.
- **Risks:** missed hardcoded href somewhere (FAB, notifications, dashboard activity links) —
  grep for `href="/` is a task-level checklist item, and redirects catch stragglers anyway.

### E9 — Module manifests + static registry (1 day)

| ID | Task | Est | Notes |
|---|---|---|---|
| E9.1 | `manifest.ts` per feature package (`ModuleDescriptor` shape from spec §12: id, title, icon, basePath, requiredPermission, requiredEntitlement — the latter two declared but unenforced). `billing` gets a stub package: manifest + placeholder page only. | 3 h | |
| E9.2 | Command-center module registry composing the eight manifests; `Sidebar` NAV_SECTIONS and dashboard module tiles render **from the registry**, all modules enabled. | 3 h | Nav must come out visually identical to today — that's the test. |
| E9.3 | E2 assertion: nav items/tiles match the registry (one data-driven spec replacing hardcoded nav checks). | 1 h | |

- **Validation:** nav and dashboard pixel-identical; suite green.
- **Rollback:** revert PR — registry replaces a hardcoded array; the array is one commit away.
- **Why in Phase 1 at all:** it locks the §12 access-logic *shape* into the codebase while the
  stakes are zero; Phase 2/5 only swap "always true" for real permission/entitlement checks.

---

## Recommended execution order (calendar)

| Day | Work | Merge gate |
|---|---|---|
| **Week 1 Mon** | E1 (all) | CI green on no-op PR |
| Tue–Thu | E2.1–E2.5 | 3 clean consecutive suite runs |
| Fri | E3 | suite green post-move; history check |
| **Week 2 Mon** | E4 | visual sweep + suite |
| Tue–Wed | E5 (contracts → lint → crm → rewire) | suite + boundary report |
| Thu–Fri | E6 (realty, then lending) | suite per PR |
| **Week 3 Mon–Wed** | E7.1–E7.5 (marketing → referrals → broker → portal → lint=error) | suite per PR; gate-verification branch |
| Thu | E8 | suite + redirect specs |
| Fri | E9 + phase retro + tag `phase1-complete` | nav identical; all DoD boxes checked |

The **first PR** is E1 (toolchain + CI), opened Monday morning. The first *interesting* PR is
E3 Friday. Optional stop/checkpoint after E6 (matches the minimal milestone path) — E7–E9 can
follow after a review pause without anything being half-done.

## Git branch strategy

- **Trunk-based.** `main` protected (CI required, 1 review, linear history). No develop branch,
  no long-lived integration branch — Phase 1 PRs are short-lived by construction.
- Branch naming: `phase1/e3-monorepo-scaffold`, `phase1/e7-1-marketing-extraction`. One branch per
  PR; branches live < 2 days; rebase on main before merge.
- **Tags as restore points:** `phase1-baseline` before E3, `phase1-eN-done` after each epic merge,
  `phase1-complete` at the end. Rollback of any epic = revert its squash commit(s); rollback of
  the phase = branch from `phase1-baseline` (never force-push main).
- Commit discipline inside extraction branches: **commit 1 = pure `git mv` (zero edits); commit 2+
  = mechanical import rewrites / config**. This keeps `--follow` history intact and makes review
  a two-pass skim instead of a 2,000-line stare.

## Pull request strategy

- **One epic-task-cluster per PR**, one package extraction per PR, squash-merged (single revertable
  commit on main).
- Every PR carries the template checklist:
  - [ ] Pure-move commits separated from edit commits
  - [ ] `pnpm dev` (webpack mode) **and** `pnpm build` verified locally
  - [ ] Characterization suite green (CI link)
  - [ ] Boundary report attached; no new violations outside the allowlist
  - [ ] No new dependencies, or each new `package.json` dep justified in the description
  - [ ] **No behavior change** attestation (E7.1 and E8 name their sanctioned exceptions explicitly)
- Size guidance: moved-file noise is unavoidable; *edited* lines per PR should stay under ~300.
  If an extraction's rewire exceeds that, split consumer rewiring into a follow-up PR.
- Review focus per PR type — moves: "is the move complete and pure?"; rewires: "are imports
  public-surface only?"; config: "does it change build output?"

## Definition of Done — per epic

| Epic | Done means |
|---|---|
| E1 | CI gates every PR (lint, typecheck, build); pnpm is the only package manager; `agency-agents` decision recorded and applied; `phase1-baseline` tag pushed |
| E2 | All 14 routes + listed interactions covered; zero exact-relative-time assertions; 3 consecutive clean runs; suite wired as a required CI check; PR template live |
| E3 | App lives in `apps/command-center` with workspace/turbo at root; dev + prod build from root; suite green; file history follows; old root layout gone |
| E4 | `@dravik/shared` and `@dravik/ui` exist with correct dependency direction; zero `@/lib/utils` imports remain; visual sweep recorded in PR; suite green |
| E5 | `@dravik/contracts` + `@dravik/crm` exist; app crm routes are thin re-exports; boundary lint reporting in CI (warn); extraction recipe doc merged; suite green untouched |
| E6 | `@dravik/realty` + `@dravik/lending` per recipe; mapping (Leaflet) spec green; dashboard + search rewired to public surfaces |
| E7 | All eight feature packages exist; `src/components`'s domain folders are empty/gone; boundary lint **errors** in CI with enumerated allowlist only; gate verified by a deliberately-failing branch |
| E8 | New namespaced routes live; every old route 308-redirects; no hardcoded old hrefs (grep-verified); suite updated + green |
| E9 | Nav + tiles render from the manifest registry, visually identical; `billing` stub package exists; `phase1-complete` tagged; Phase 1 retro notes captured |

---

## Phase-wide risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Tailwind 4 token extraction shifts styling | Med | Med | Tokens move in an isolated commit; named visual-sweep task; revert is surgical |
| Leaflet breaks under transpilePackages | Med | Med | Dynamic imports moved untouched; mapping spec is a required check |
| `timeAgo` makes tests flaky over time | High | Low | Banned exact-string assertions (E2.4); pattern-match instead |
| Parallel extractions conflict in shared consumers | Med | Low | Serialize merges; rebase-before-merge rule |
| Scope creep ("while I'm in here…") | High | Med | PR checklist's no-behavior-change attestation; reviewers reject mixed PRs |
| Phantom deps surface under pnpm strictness | Med | Low | Declare deps; never enable global hoisting |
| Fixture-export allowance quietly becomes permanent | Med | Med | Allowlist entries carry Phase-4 removal tickets; lint keeps them enumerated |
| Old URLs break for anyone with bookmarks | Low | Low | 308 redirects + redirect specs in E8 |

**Out of scope for Phase 1, by design (do not let these in):** auth, Entra, Postgres, API routes,
repository interfaces (Phase 3a), entitlement logic, ACA/infra, data shape changes (ISO dates etc.
arrive with contracts hardening in Phase 3/4).
