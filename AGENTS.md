# Working in this repository

TypeScript monorepo for NEAR Protocol client libraries. pnpm workspaces, Node >= 25.

## Conventions

**[skills/module-placement/SKILL.md](skills/module-placement/SKILL.md) — where a module file belongs.**
Read it before adding, splitting, moving or renaming any file under
`packages/near-api-ts/*/src`. Folder structure there is derived mechanically from the
import graph, not chosen by taste: the document defines what counts as a consumer, when a
module moves into `_common/`, and how deep the `_common/` chain goes. Placing a file by
intuition will get it wrong.

Files under `skills/` are plain markdown and readable by any agent or human. Claude Code
picks them up through symlinks in `.claude/skills/` (which is git-ignored).

## Commands

Run from the repo root:

| | |
|---|---|
| `pnpm build` | build all packages |
| `pnpm typecheck` | typecheck all packages |
| `pnpm lint:fix` | format and lint with Biome |
| `pnpm sandbox:start` / `pnpm sandbox:stop` | local NEAR sandbox for integration tests |

Inside `packages/near-api-ts`: `npx vitest run universal/tests/unit nodejs/tests/unit`
runs the unit tests without a sandbox. The integration suites need the sandbox running.

## Notes

- `packages/react-near-ts` currently fails `typecheck` on a pre-existing error in
  `tests/hooks/useContractReadFunction.type-test.tsx`. It is unrelated to `near-api-ts`.
- `architecture/` holds design drafts, not current conventions. Do not treat it as a
  description of how the code works today.
