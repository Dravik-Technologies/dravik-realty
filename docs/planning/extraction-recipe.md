# Module Extraction Recipe

Use this checklist for Phase 1 package extractions after E5.

## Preconditions

- Branch from up-to-date `main` after the previous epic is merged.
- Confirm the workspace packages needed by the target package already exist.
- Capture the CSS referee before edits:

```bash
rm -rf apps/command-center/.next
pnpm build
md5sum apps/command-center/.next/static/chunks/*.css | awk '{print $1}' | sort > /tmp/css-baseline.hashes
```

## Scaffold

- Create the package manifest, `tsconfig.json`, and public `src/index.ts`.
- Keep public exports narrow. Use per-module subpaths for contracts packages.
- Resolve within-module star-export collisions with an explicit canonical re-export on the module index, chosen by auditing actual importers. Do not rename inside moved files during an extraction epic; defer renames to contract hardening.
- Declare workspace dependencies explicitly. Feature packages may depend on shared, ui, and contracts, but not other feature packages.
- Audit framework specifiers such as `next/*` during dependency derivation. Framework packages are `peerDependencies` plus exact-version `devDependencies`; never regular dependencies.
- `globals.css` carries a single `@source "../../../../packages";` umbrella, so extractions need no per-package `@source` changes. The CSS referee still guards the outcome. Note: class strings currently live in contracts (`SOURCE_STYLES`, `KANBAN_COLUMNS`), flagged for relocation to the owning feature package in Phase 3 contract hardening.

## Pure Move Commit

- Use `git mv` for all moved files.
- Do not edit moved file contents in the move commit.
- Verify `git show --stat --find-renames=100% HEAD` shows pure renames before moving on.

## Rewire Commit

Apply only mechanical import rewrites:

| Old source | New source |
| --- | --- |
| App-owned types moved to contracts | `@dravik/contracts/<module>` |
| App-owned fixtures moved into package data | Relative package paths such as `../../data/<file>` |
| App-owned package components | Relative package paths such as `./Component` or `../components/...` |
| App route consumers | Public package exports such as `@dravik/crm` |
| App composition fixture reads | Public package fixture exports, temporarily allowed |

Route files stay in the app. If a route exports metadata, keep the metadata in the app route and replace only the rendered component with the package page export. Client package pages must not export metadata.

Temporary fixture exports are allowed from package `index.ts` only for Phase 1 composition. They are removed in Phase 3a when repository interfaces replace fixture imports.

After rewiring, derive dependencies from the package source:

```bash
grep -rhoE 'from "[^.@/][^"]*"|from "@[a-z-]+/[^"]*"' packages/<name>/src | sort -u
```

Every external specifier must be covered by `dependencies`, `peerDependencies`, or `devDependencies`, with framework imports following the peer-plus-dev rule.

## Validation

- `pnpm install --frozen-lockfile`
- `pnpm lint && pnpm typecheck && pnpm build`
- CSS referee:

```bash
rm -rf apps/command-center/.next
pnpm build
md5sum apps/command-center/.next/static/chunks/*.css | awk '{print $1}' | sort > /tmp/css-after.hashes
diff /tmp/css-baseline.hashes /tmp/css-after.hashes
```

- `pnpm boundaries` with zero warnings.
- Grep for leftover app aliases in package files and moved source areas.
- Run webpack dev smoke checks for affected routes.
- Run `pnpm test:e2e` without editing tests.

## Stop Conditions

Stop and leave the branch unpushed if CSS hashes differ, boundary lint reports warnings, dependency derivation finds an undeclared or unapproved specifier, validation requires edits outside the allowed transforms, tests need changes, or the required commit count would change.
