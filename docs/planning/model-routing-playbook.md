# AI Model Routing Playbook

> Purpose: control credit burn across the DRAVIK migration by routing each task to the cheapest
> resource that can do it safely. Claude is the architect/reviewer, not the ticket-carrier.
> Companion to the [Phase 1 execution backlog](./phase-1-execution-backlog.md).

## The routing rule (apply in order)

1. **Deterministic tool first — zero tokens.** If grep, `tsc`, eslint, dependency-cruiser, or CI
   can answer it, no model touches it. Import maps, coupling reports, "find all usages,"
   lint/type/build verification — all free, all more reliable than any LLM.
2. **Recipe-driven mechanical change → Codex.** File moves, import rewrites, package scaffolding,
   test stubs, lint fixes. Precondition: a written recipe exists and CI + the characterization
   suite verify the result. Codex follows instructions; it does not make judgment calls.
3. **Volume reading → Gemini.** Summarizing unfamiliar library docs, first-pass review of large
   diffs for behavior changes, drafting documentation from existing material. Token-heavy,
   judgment-light.
4. **Judgment, security, architecture, approval → Claude.** Anything where being wrong costs more
   than the tokens saved: boundary design, auth/RLS/entitlement work, migration sequencing,
   final diff review, anything touching money or tenant isolation.

**The enablers that make cheap routing safe** (already in place): the written backlog and specs
(the prompt *is* the spec), the 40-test characterization suite, CI gates on every PR, and the PR
checklist. Never route mechanical work to a cheap model on a path CI can't verify.

## Phase 1 task routing

| Task | Claude | Codex | Gemini | Free tooling |
|---|---|---|---|---|
| E3 monorepo scaffold | Confirm task card; review diff (move purity, config semantics, history) | Execute moves + config edits per backlog E3.1–E3.4 | — | CI + characterization suite verify |
| E4 shared/ui extraction | Review diff; judge Tailwind token extraction (visual risk) | Move files; codemod `@/lib/utils` imports | — | CI; visual sweep is human |
| E5 contracts + boundary lint + crm template | **Claude-heavy:** boundary config is judgment; write extraction recipe | Mechanical parts of the crm move | — | dependency-cruiser becomes the free boundary report |
| E6–E7 remaining extractions | Spot-review one PR in three; review E7.1 (PropertyPagePreview prop seam — the one real refactor) | Execute recipe verbatim, one package per PR | First-pass diff review before Claude | CI per PR |
| E8 route namespacing | Review redirect map once | Move route dirs, update hrefs, write redirects | — | Redirect specs in CI |
| E9 manifests + registry | Review registry design (locks in §12 shape) | Generate the eight manifest files from the spec table | — | CI |
| Docs upkeep | — | — | Draft from existing specs | — |

Expected Phase 1 split: roughly 15–20% Claude, 60% Codex, 5% Gemini, the rest free tooling.

## Phase 2+ caveat — the ratio inverts

Entra integration, session/BFF auth, RLS policies, the entitlement engine, and billing webhooks
are judgment work where rework costs exceed token savings. Route those to Claude, with Codex
limited to scaffolding around approved designs. Re-evaluate the split at each phase boundary, not
once for the whole project.

## Handoff prompt templates

**Codex execution** (paste with the backlog section):

```
Execute exactly the following task from docs/planning/phase-1-execution-backlog.md: <task id>.
Branch: <branch>. Rules: pure `git mv` commit first, edit commits after; no behavior changes;
no new dependencies; do not touch files outside the task. Done when: pnpm lint, pnpm exec tsc
--noEmit, pnpm build, and pnpm test:e2e all pass locally. Stop and report instead of improvising
if the recipe doesn't match reality.
```

**Gemini first-pass diff review:**

```
Review this diff against docs/planning/phase-1-execution-backlog.md <task id>. Report only:
(1) changes that could alter runtime behavior, (2) files touched outside the task scope,
(3) import rewrites that don't point at the package public surface. No style commentary.
```

**Claude final review** (small, cheap):

```
The diff for <task id> passed CI and Gemini first-pass. Review only what automation can't judge:
move-commit purity, config semantic changes, history preservation, boundary intent. Approve or
list blockers.
```

## Accounting

Note the executing model in each PR description (the template's "What" section). Revisit this
playbook monthly against actual credit spend; promote tasks to cheaper routes only when their
verification is fully automated.
