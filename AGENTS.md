# Working in this repository

TypeScript monorepo for NEAR Protocol client libraries. pnpm workspaces, Node >= 25.

## Conventions

Use Conventional Commits for every commit message: `<type>(optional-scope): <description>`
(for example, `fix(transaction): handle expired delegation`).

**[skills/module-placement/SKILL.md](skills/module-placement/SKILL.md) — where a module file belongs.**
Read it before adding, splitting, moving or renaming any file under
`packages/near-api-ts/universal/src`. Which folder owns a module, and how deep in that
folder's `_common/` chain it sits, is derived mechanically from the value-import graph —
not chosen by taste. The document defines what counts as a consumer, what the algorithm
decides and what is left to cohesion, and how the layers work. Placing a file by intuition
will get it wrong; run `pnpm check:placement` to find out.

**[skills/release-changelog/SKILL.md](skills/release-changelog/SKILL.md) — what to put in a
CHANGELOG entry.** Read it before preparing a release, filling in an `[UNRELEASED]` section,
or answering what changed since a published version. The public surface of a package is
what its entry files export and nothing else; the document gives the mechanical diffs that
derive it, and explains why commit messages and `git diff --stat` mislead over a release
range.

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

- Never interact with a remote repository. Do not run `git push`, `git pull`, `git fetch`,
  or any other command that reads from or writes to a remote; the user performs all
  remote repository operations exclusively.
- `architecture/` holds design drafts, not current conventions. Do not treat it as a
  description of how the code works today.
