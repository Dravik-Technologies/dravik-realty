# DRAVIK Platform — Phase Roadmap & Current Status

> **Single source of truth for phase sequencing, status, and exit criteria.**  
> What we build: [docs/architecture/implementation-spec.md](../architecture/implementation-spec.md)  
> How Phase 1 is executed: [docs/planning/phase-1-execution-backlog.md](./phase-1-execution-backlog.md)  
> Older foundation (superseded in structure + phase numbering): [docs/architecture/platform-foundation.md](../architecture/platform-foundation.md)

**Last structured:** 2026 (analysis against current working tree)  
**Overall project status:** Pre-Phase 0 / Phase 1 rails not started. Prototype intact.

---

## Current State Assessment (Working Tree)

| Area                  | Actual State (now)                          | Plan Expectation (Phase 0/1 entry)          | Gap |
|-----------------------|---------------------------------------------|---------------------------------------------|-----|
| Package manager       | npm + `package-lock.json`, name=`real-estate` | pnpm + `pnpm-lock.yaml` early              | E1.1 |
| Monorepo              | Flat root Next.js (`src/app/`, `src/components/`, etc.) | `apps/command-center/`, `packages/*`, turbo | E3  |
| CI / Gates            | None (no `.github/`)                        | `.github/workflows/ci.yml` (lint, typecheck, build) + boundary | E1.3 |
| Characterization      | None                                        | Full Playwright suite over 14 routes + key interactions | E2  |
| `agency-agents/`      | Present (nested git repo)                   | `.gitignore` or external (record decision) | E1.2 |
| Routes & behavior     | Full prototype: shell (dashboard, leads, inbox, prospecting, mapping, marketing, mortgage, referral-network, reports, settings, team, transactions), portal, [module] catch-all, root→dashboard redirect | Preserve 100% (redirects allowed in Phase 1) | — (good) |
| Naming / Branding     | Mix of "axen", "dravik", default Next README | Consistent Dravik / `@dravik/*` packages   | Hygiene |
| Boundary enforcement  | None                                        | dependency-cruiser or eslint-plugin-boundaries (warn → error) | E5/E7 |
| Module manifests      | Hardcoded nav/tiles                         | Static `ModuleDescriptor` registry (E9)    | E9  |
| Data                  | All in `src/data/*.ts` + `src/types/` fixtures | Move into owning packages (temporary fixture exports allowed Phase 1) | E5–E7 |

**Key observation:** The codebase is a faithful implementation of the "current prototype" described in the specs. **Zero structural changes** from the plans have landed. This is the ideal moment to execute Phase 0/1 rails — the characterization suite will be written against the exact behavior we must preserve.

---

## Approved Phase Model (Implementation Spec §16)

This model supersedes the numbering and sequencing in `platform-foundation.md`. Logical separation first; physical extraction only on explicit triggers (Phase 6).

| Phase | Name | Focus | Key Exit Criteria | Parallelism | Status |
|-------|------|-------|-------------------|-------------|--------|
| **0** | Rails | Toolchain, hygiene, safety net | pnpm; CI green on every PR; Playwright characterization suite (14 routes + interactions) passing 3× locally + in CI; `agency-agents` decision recorded; `phase1-baseline` tag | N/A | **Not started** |
| **1** | Re-org to target structure | Pure refactor to monorepo + package boundaries (no behavior change, no auth, no DB) | Target tree (`apps/command-center`, 8 feature packages + shared/ui/contracts); boundary lint errors in CI (with enumerated allowlist); route namespacing + 308 redirects; manifests + registry driving nav/tiles; characterization green throughout; `phase1-complete` tag | E6/E7 can overlap with later Phase 2 prep | **Not started** (detailed execution in `phase-1-execution-backlog.md`) |
| **2** | Identity + infra | Entra External ID (single external tenant), ACA + Postgres/Redis/SB/KV/FD IaC, BFF sessions, `core` schema, invitations | Invited agent signs in, sees tenant-scoped shell; client lands in `/portal`; staging deploy behind login | Safe to start after E3/E4 (no app source changes required) | Not started |
| **3** | Data seam | Repository interfaces (fixture-backed first), API spine + platform services, `/me/context`, first module (CRM) conversion | CRM on real `crm` schema + RLS; tenant-isolation tests pass; fixtures deleted for converted modules; rest of app still fixture-backed behind interfaces | CRM can lead; others wait on spine | Not started |
| **4** | Module conversions | Portal grants → Referrals → Marketing → Lending → Realty → Broker (coupling order); Command Center last (onto reporting projections) | Each module: schema + contracts + API + rewire + fixture deletion + events; access matrix + tenant isolation green | Staggered; portal first (smallest blast radius) | Not started |
| **5** | Billing + gating | Stripe, plans, webhooks, `EntitlementSnapshot` + Redis, middleware gates (stub→enforcing), tile states, nav gating | Core-plan tenant blocked from Lending; upgrade unlocks without redeploy; access-matrix suite green | Overlaps Phase 4 (billing schema + contracts early) | Not started |
| **6** | Operate + conditional extraction | Production ops, monitoring, triggers for physical split | Extraction only on named trigger (scale, ownership, compliance isolation e.g. Lending PII). Client Portal is first candidate regardless. Modular monolith on ACA is valid long-term end state. | N/A | Not started |

**Constraint honored across all phases:** preserve working app + characterization suite green at every merge. "Logical separation first, physical separation later. No microservices. No rebuild."

---

## Phase 1 Execution Snapshot (from backlog)

See the full living document: [phase-1-execution-backlog.md](./phase-1-execution-backlog.md)

**Epics (E1–E9, ~15 person-days):**

- **E1 Rails** (1d): pnpm, agency-agents hygiene, CI skeleton, branch protection + `phase1-baseline` tag.
- **E2 Characterization** (2.5d): Playwright (build+start webServer), route smoke ×14, interaction specs (kanban, pipelines, search, mapping filters, etc.), flake-proofing, PR template.
- **E3 Monorepo scaffold** (1d): pnpm workspaces + turbo at root; `git mv` app → `apps/command-center` (pure move commit first); config follow-up.
- **E4** `packages/shared` + `packages/ui` (1d).
- **E5** `packages/contracts` + boundary lint (warn) + `packages/crm` as template (2.5d) + `extraction-recipe.md`.
- **E6** `packages/realty` + `packages/lending` (2d).
- **E7** Remaining packages (marketing, referrals, broker, portal) + lint → error (3d).
- **E8** Route namespacing (`/leads` → `/crm/leads` etc.) + permanent redirects + spec updates (1d).
- **E9** Module manifests + static registry driving Sidebar + dashboard tiles (1d); `billing` stub.

**Critical disciplines called out:**
- Pure `git mv` commits separated from edit/rewire commits.
- Characterization suite is the non-negotiable tripwire.
- Boundary lint starts warn, flips to error only after all packages exist.
- Temporary fixture-export allowlist (documented, Phase-4 removal tickets attached).
- One sanctioned behavior change in E7.1 (PropertyPagePreview takes prop instead of direct import).

**Natural checkpoint:** After E6 the repo already matches the "minimal approved milestone path".

---

## Pre-Phase 0 / Rails — Immediate Action Checklist (E1 + T1–T3)

These are the lowest-risk, highest-leverage first steps. They enable everything that follows.

From implementation-spec "First safe implementation tasks" + backlog E1/E2:

1. **T1 / E1.1** — Adopt pnpm (single package for now): delete `package-lock.json`, `pnpm install`, commit `pnpm-lock.yaml`. Verify `pnpm dev --webpack` and `pnpm build`.
2. **E1.2** — Decide & action `agency-agents/`: add to `.gitignore` (recommended for now) or move outside repo. Record decision + rationale in the commit/PR.
3. **T2 / E1.3** — Create `.github/workflows/ci.yml`: pnpm (frozen), eslint, `tsc --noEmit`, `next build`. Trigger on PR + push to main.
4. **E1.4** — Branch protection on `main` (CI required + 1 review). Push `phase1-baseline` tag on the commit before any re-org work.
5. **T3 / E2** — Build the Playwright characterization suite (config with webServer against prod build, chromium, fixed viewport; 14 route smokes + the listed interactions; no exact `timeAgo` strings; PR template with Phase 1 checklist).

**Validation for Rails complete:** CI green on a no-op PR; full suite passes 3 consecutive runs locally + once in CI; app runs via `pnpm dev`.

**Rollback surface:** trivial at this stage (restore lockfile, delete workflow, delete test folder).

---

## Structuring Notes & Open Decisions (Living)

- **Document ownership:** This file (`phases.md`) is the status/roadmap layer. Do not duplicate detailed task lists here — reference the backlog and spec.
- **Naming consistency:** Current package.json still says "real-estate". Spec calls for `@dravik/command-center` and `@dravik/*` packages. Resolve during E1 or E3.
- **Branding drift:** Logos and tokens reference "axen" in places. Track as hygiene item or defer to a dedicated branding pass post-Phase 1.
- **agency-agents integration:** The collection itself is valuable (many project-management and engineering specialists). The only issue is the nested `.git`. Once ignored/relocated, we can still consume specific agents via the scripts or manually.
- **Extraction recipe:** The backlog requires `docs/planning/extraction-recipe.md` to be written as part of the CRM template PR (E5). This will become the checklist for E6/E7.
- **PR template:** Must be added in E2.5 and carried by every Phase 1 PR.
- **Phase 2 prep (non-code):** Entra tenant + app registrations and IaC skeleton can (and should) start in parallel as soon as E3 lands (or even earlier, since they touch no app source).
- **Supersession note:** `platform-foundation.md` Phase numbering and some repository layout details (e.g. `apps/web` vs `apps/command-center`) are superseded by `implementation-spec.md`. Future readers should treat implementation-spec + this phases.md + the Phase 1 backlog as the current canon.
- **Test philosophy:** Characterization first (E2), then package unit tests, contract tests, tenant-isolation as non-negotiable standing suites, access-matrix table-driven tests.

---

## Recommended Next Steps (as of this structuring)

1. **Adopt this document** as the phase status source of truth (review + minor edits if needed).
2. Execute E1 in a single focused PR (or 2–3 tiny ones): pnpm + agency-agents decision + CI.
3. Immediately follow with the characterization suite (E2) — this is the highest-ROI safety investment in the entire program.
4. Tag `phase1-baseline`.
5. Open the E3 monorepo PR only after the suite is trusted.
6. (Parallel track) Stand up Entra external tenant registration work and basic IaC repo skeleton.

**If you want this agent to continue structuring:**
- Generate the Phase 1 PR template content.
- Draft the `extraction-recipe.md` skeleton (ready for the CRM PR).
- Produce a one-page "Phase 1 kickoff" brief.
- Begin mechanical execution of E1 items (pnpm migration, gitignore for agency-agents, CI workflow).
- Create a simple status dashboard (e.g. in docs or as a markdown table that CI can comment on).

All characterization specs, boundary rules, and module manifests are already described at the right level of detail in the linked architecture and planning docs. The job of "structuring the phases" is largely complete once we have:
- This overview live.
- The safety net (E2) in place.
- The first rails PRs flowing.

---

**Phase structure owned by:** Project Shepherd / Phase Prioritizer role (in the spirit of the agency-agents collection in this repo).

Ready to execute or refine further on your direction.
