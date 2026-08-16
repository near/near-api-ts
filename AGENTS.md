# Working in this repository

TypeScript monorepo for NEAR Protocol client libraries. pnpm workspaces, Node >= 25.

## Conventions

**[skills/module-placement/SKILL.md](skills/module-placement/SKILL.md) — where a module file belongs.**
Read it before adding, splitting, moving or renaming any file under
`packages/near-api-ts/universal/src`. Which folder owns a module, and how deep in that
folder's `_common/` chain it sits, is derived mechanically from the value-import graph —
not chosen by taste. The document defines what counts as a consumer, what the algorithm
decides and what is left to cohesion, and how the layers work. Placing a file by intuition
will get it wrong; run `pnpm check:placement` to find out.

Files under `skills/` are plain markdown and readable by any agent or human. Claude Code
picks them up through symlinks in `.claude/skills/` (which is git-ignored).

## Commands

Run from the repo root:

| | |
|---|---|
| `pnpm build` | build all packages |
| `pnpm typecheck` | typecheck all packages |
| `pnpm lint:fix` | format and lint with Biome |
| `pnpm check:placement` | check `universal/src` against the module-placement convention |
| `pnpm sandbox:start` / `pnpm sandbox:stop` | local NEAR sandbox for integration tests |


## Notes

- `architecture/` holds design drafts, not current conventions. Do not treat it as a
  description of how the code works today.
