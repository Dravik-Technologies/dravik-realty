# Branch protection — recommended settings for `main`

> Companion to the Phase 1 execution backlog (E1.4). Branch protection lives in GitHub repository
> settings, not in the repo itself — apply these via the UI or the CLI commands below.

## Recommended ruleset for `main`

| Setting | Value | Why |
|---|---|---|
| Require a pull request before merging | On, 1 approving review | No direct pushes; every change is reviewed against the Phase 1 PR checklist |
| Require status checks to pass | On — required check: `lint · typecheck · build` (workflow `ci`) | The merge gate; E2 adds the Playwright check to this list |
| Require branches to be up to date before merging | On | Forces rebase-before-merge, per the Phase 1 branch strategy |
| Require linear history | On | Squash-merge only; one revertable commit per PR |
| Require conversation resolution before merging | On | Review comments can't be merged past |
| Block force pushes | On | `phase1-baseline` and epic tags stay trustworthy |
| Restrict deletions | On | `main` cannot be deleted |
| Allowed merge methods (repo setting) | Squash only | Matches the rollback model: revert = one commit |

## Apply via GitHub UI

Repository → Settings → Branches → Add branch ruleset → target `main`, enable the rows above.
(Or Settings → Rules → Rulesets on newer UI.)

## Apply via GitHub CLI

```bash
gh api repos/Dravik-Technologies/dravik-realty/branches/main/protection \
  --method PUT \
  --field "required_status_checks[strict]=true" \
  --field "required_status_checks[contexts][]=lint · typecheck · build" \
  --field "enforce_admins=true" \
  --field "required_pull_request_reviews[required_approving_review_count]=1" \
  --field "required_linear_history=true" \
  --field "allow_force_pushes=false" \
  --field "allow_deletions=false" \
  --field "restrictions=null"
```

Squash-only merges (repo-level, separate from branch protection):

```bash
gh api repos/Dravik-Technologies/dravik-realty \
  --method PATCH \
  --field allow_squash_merge=true \
  --field allow_merge_commit=false \
  --field allow_rebase_merge=false \
  --field delete_branch_on_merge=true
```

Note: the required-check context name must match the CI job name exactly
(`lint · typecheck · build` from `.github/workflows/ci.yml`); update both together if the job is
renamed. The check only becomes selectable in the UI after it has run at least once (the E1 PR
triggers that first run).
