# near-ts

Monorepo for the TypeScript client libraries for [NEAR Protocol](https://near.org) — a
low-level API for any JavaScript runtime, and a React toolkit built on top of it.

Both packages share one design: everything is typed end to end, every fallible function has
a `safe*` twin that returns a `Result` instead of throwing, and every failure is a typed
error with a literal `kind` you can narrow on.

## Packages

| Package | Version | What it is |
| --- | --- | --- |
| [**near-api-ts**](packages/near-api-ts) | [![npm](https://img.shields.io/npm/v/near-api-ts.svg)](https://www.npmjs.com/package/near-api-ts) | The core library: RPC client, transaction signing and sending, meta transactions, global contracts, key management, NEP-413 messages. Runs in Node.js 25+ and the browser. |
| [**react-near-ts**](packages/react-near-ts) | [![npm](https://img.shields.io/npm/v/react-near-ts.svg)](https://www.npmjs.com/package/react-near-ts) | React bindings: providers, wallet connection via `@hot-labs/near-connect`, and TanStack Query-powered hooks. Re-exports the whole `near-api-ts` surface. |

**Start here:**

- [`packages/near-api-ts/README.md`](packages/near-api-ts/README.md) — getting started and a
  tour of the library ([changelog](packages/near-api-ts/CHANGELOG.md))
- [`packages/react-near-ts/README.md`](packages/react-near-ts/README.md) — providers and
  hooks ([changelog](packages/react-near-ts/CHANGELOG.md))

Which one you want: reach for **react-near-ts** in a React app where a browser wallet signs
the transactions, and for **near-api-ts** everywhere else — backends, scripts, CLIs, or a
frontend that manages its own keys. `react-near-ts` depends on `near-api-ts`, so you never
need to install both.

### Live demo

A full Next.js App Router example — wallet connect, account info, transfers, contract
read/write — runs at
[react-near-ts-next-playground.vercel.app](https://react-near-ts-next-playground.vercel.app),
with its source in [`playgrounds/react-near-ts/next-app-router`](playgrounds/react-near-ts/next-app-router).

## Repository layout

```text
packages/
  near-api-ts/      universal/, nodejs/ and browser/ entry points, plus the test suites
  react-near-ts/    the React layer
playgrounds/        runnable example apps
skills/             conventions written for both humans and coding agents
scripts/            repo tooling (module-placement check, local NEAR sandbox)
architecture/       design drafts — not a description of the current code
```

## Development

Requires Node.js 25+ and pnpm 11.

```bash
pnpm install
```

Run from the repo root:

| Command | What it does |
| --- | --- |
| `pnpm build` | build every package |
| `pnpm dev` | rebuild every package on change |
| `pnpm typecheck` | typecheck every package |
| `pnpm lint:fix` | format and lint with Biome |
| `pnpm check:placement` | check `near-api-ts/universal/src` against the module-placement convention |
| `pnpm sandbox:start` / `pnpm sandbox:stop` | start or stop a local NEAR sandbox node |

Tests live under each package's `tests/` folders and run with Vitest. Integration tests
start their own sandbox, so no node has to be running beforehand.

## Conventions

[`AGENTS.md`](AGENTS.md) is the entry point for anyone — human or agent — making changes
here. The two rules worth knowing up front:

- **[`skills/module-placement`](skills/module-placement/SKILL.md)** — where a module file
  belongs under `near-api-ts/universal/src` is derived mechanically from the import graph,
  not chosen by taste. Read it before adding, moving or splitting a file.
- **[`skills/release-changelog`](skills/release-changelog/SKILL.md)** — how to work out
  what actually changed in a package's public API, and how to write the changelog entry.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):
`<type>(optional-scope): <description>`.

## License

MIT — see [LICENSE.md](LICENSE.md).
