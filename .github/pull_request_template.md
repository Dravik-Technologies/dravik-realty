<!-- Map this PR to its backlog task (e.g. "Phase 1 / E4.1"). -->

## What

## Why

## Phase 1 checklist

- [ ] Pure-move commits are separated from edit commits (`git mv` first, rewires after)
- [ ] `pnpm dev` (webpack mode) **and** `pnpm build` verified locally
- [ ] Characterization suite green (link the CI run)
- [ ] Boundary report attached — no new violations outside the allowlist *(applies once E5 lands)*
- [ ] No new dependencies, or each new dependency is justified below
- [ ] **No behavior change** — or the sanctioned exception is named explicitly (E7.1 / E8 only)

## Rollback

<!-- Default: revert the squash commit. Note anything extra (tags, CI settings). -->
