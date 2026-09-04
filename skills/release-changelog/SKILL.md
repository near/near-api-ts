---
name: release-changelog
description: Work out what actually changed in a package's public API since its last release, and write the CHANGELOG entry for the next version. Use whenever a release is being prepared or a version bumped in this repo, and whenever someone asks what changed, what is breaking, or what a user of the previous version has to update — including phrasings like "prepare the release", "fill in the changelog", "what's new since v0.11.0", or "is this breaking?".
---

# Writing a release changelog

The reader is someone running the **previous** version who wants to upgrade. The entry
answers one question: *what do I have to change in my code?* Everything that does not
change their code is noise — internal renames, module moves, refactors, nearcore
rationale, how the feature is implemented.

This repo restructures aggressively between releases. A release range is mostly file
moves, so `git diff --stat` over the package tells you nothing. Derive the surface
mechanically instead; reading the diff by eye misses things, and reading commit messages
misleads.

Changelogs live at `packages/<pkg>/CHANGELOG.md`. Work top-down through the steps below.

## Step 0 — Pin the baseline

Find the commit that released the previous version:

```bash
git log --oneline -S'"version": "0.11.0"' -- packages/near-api-ts/package.json
```

If someone hands you a starting commit, check it against that one rather than trusting it:

```bash
git rev-list --count <release-commit> <given-commit>
git log --oneline <release-commit>..<given-commit>
```

A gap of a few test-only commits is fine. A gap containing real work means the entry will
silently drop those changes. Say so and use the release commit.

Everything below uses `RANGE=<release-commit>..HEAD`.

## Step 1 — Know what the public surface is

Only what an entry file exports is public. Everything under `src/` and `types/` is
internal unless it is reachable from one of these:

| Package | Entry files | Also public |
|---|---|---|
| `near-api-ts` | `universal/index.ts`, `browser/index.ts`, `nodejs/index.ts` | `package.json` — `exports` subpaths, `engines`, `peerDependencies`, `dependencies` |
| `react-near-ts` | `src/index.ts` | same fields of its `package.json` |

`browser/index.ts` and `nodejs/index.ts` mostly `export * from '../universal/index'`, so
diff them too — a change there is a change to a subpath import.

## Step 2 — Diff the exported names

```bash
cat > /tmp/api-exports.py <<'PY'
import re, subprocess, sys
rev, path = sys.argv[1], sys.argv[2]
src = (open(path).read() if rev == 'WORKTREE'
       else subprocess.run(['git','show',f'{rev}:{path}'], capture_output=True, text=True).stdout)
names = set()
for block in re.finditer(r'export\s+(?:type\s+)?\{([^}]*)\}', src, re.S):
    for spec in block.group(1).split(','):
        spec = spec.strip()
        if spec:
            names.add(spec.split(' as ')[-1].strip())
print('\n'.join(sorted(names)))
PY
F=packages/near-api-ts/universal/index.ts
comm -23 <(python3 /tmp/api-exports.py <release-commit> $F) <(python3 /tmp/api-exports.py WORKTREE $F)  # removed
comm -13 <(python3 /tmp/api-exports.py <release-commit> $F) <(python3 /tmp/api-exports.py WORKTREE $F)  # added
```

The script reads the name *after* `as`, which is what callers import — that matters,
because this repo has renamed internals while keeping the public alias identical.

**Renames arrive as a removed + added pair.** Open the new export's path to confirm it is
the same thing under a new name (`objectToU8` → `convertObjectToU8`), and write it as one
rename bullet, not one removal plus one addition.

## Step 3 — Diff the error kinds

Error kinds are public API here: users match them with `isNatError(e, 'Some.Kind')`, so a
renamed kind breaks their code with no runtime signal. They are string-literal keys in the
`*PublicErrorRegistry` interfaces under `types/`, which makes them greppable:

```bash
kinds() {  # usage: kinds <rev|WORKTREE> <types-dir>
  if [ "$1" = WORKTREE ]; then grep -rhoE "'[A-Za-z][A-Za-z0-9.]*'[[:space:]]*:" "$2"
  else git grep -hoE "'[A-Za-z][A-Za-z0-9.]*'[[:space:]]*:" "$1" -- "$2"; fi \
  | sed -E "s/^'//; s/'[[:space:]]*:$//" | grep '\.' | sort -u
}
D=packages/near-api-ts/universal/types
comm -23 <(kinds <release-commit> $D) <(kinds WORKTREE $D)   # removed
comm -13 <(kinds <release-commit> $D) <(kinds WORKTREE $D)   # added
```

Three things this output does not tell you on its own:

- **Derived kinds are invisible.** `Client.SendSignedTransaction.Rpc.${K}` and
  `MemorySigner.ExecuteTransaction.Rpc.${K}` are built with template literals over
  `ConversionFailureRegistry` / `ExecutionFailureRegistry`. Renaming one base kind renames
  every kind derived from it. State the propagation once with an example instead of
  listing the cross-product.
- **Contexts change without the kind changing.** For every kind you cite, open its registry
  entry at both revisions. `Signer.NotEnoughBalance` → `Signer.Budget.NotEnough` also
  swapped `transactionCost` for `minimalMissingAmount`; a reader who only renames the kind
  still breaks.
- **An added kind with no removed partner can still be a change in behaviour.** In v0.12.0
  `SignTransaction.SignData.Failed` was added with nothing removed, because previously the
  signer's raw error leaked through the error union unwrapped. Check what used to happen in
  that situation before filing it under "Added".

## Step 4 — Follow every surviving type into its diff

A stable name is not a stable shape, and neither script above catches this. It is where
most real breakage lives. For each type still exported, diff its declaration:

```bash
git diff $RANGE -- <path>                              # if the file did not move
diff <(git show <release-commit>:<old-path>) <new-path>  # if it did
```

Two from v0.12.0, both invisible to Steps 2 and 3: `SignedTransaction` kept its name and
lost `transactionHash` and `signedTransactionBorsh64`; `GetAccountInfoOutput` kept its name
and had three nullable fields collapse into one `contract` union.

Follow through to the arg and output types of exported functions too, not just the types
in the export list.

## Step 5 — Decide breaking vs additive, and check the escape hatches

- **A new member of an exported union is breaking** for anyone switching exhaustively over
  it. `Action` → `TransactionAction` gained four action types; say that exhaustive switches
  need new branches.
- **A new error kind is additive**, but say what used to happen — "these previously
  surfaced as `Internal`" is the sentence that makes it useful.
- **A restructured output may still satisfy its usual consumer.** Read the consumer's arg
  type before calling it breaking. `SignTransactionOutput` was restructured but still
  satisfies `sendSignedTransaction`'s `signedTransaction` argument structurally, so the
  common `sign → send` pipeline is untouched and only direct field access has to change.
  That distinction is often the most useful sentence in the whole entry.

## Step 6 — Use commits for grouping, not for facts

Commit messages are a bad source of truth for a release range:

- Work added and then removed inside the range nets to zero. A "complete the shard
  conversion error block" commit contributed nothing to v0.12.0 — a later commit dropped
  those kinds again.
- A commit that reads like a breaking rename can be internal only. "remove throwable
  prefixes" renamed internals whose public aliases never changed.

Read `git log --oneline $RANGE` to learn what the features *are* and how to group them,
then verify every claim against the endpoint diff.

## Step 7 — Write the entry

Match the file's existing shape:

```markdown
## [UNRELEASED] v0.12.0

### Added
### Changed
### Removed

---
```

- Keep the `[UNRELEASED]` marker and leave `package.json` alone unless the user asks for
  the release to be cut. Bumping the version is their call.
- Omit a section that would be empty.
- Group by feature, not by commit. One bullet per feature with sub-bullets beats ten flat
  bullets tracing the order the work happened in.
- For a restructured output, show `Previously:` and `Now:` code blocks — that is the
  established style here and it reads faster than prose.
- List renames exhaustively as `old` → `new`, including changed context/field names.
- For a removal, give the replacement or the workaround. `u8ToObject` was removed with no
  successor, so the entry shows the one-liner that replaces it.
- Protocol and nearcore rationale gets at most a clause. "Registering is asynchronous, so a
  pin sent immediately after can fail" earns its place; the nearcore call path does not.
- Do not mention internal renames, module moves, or type-file paths. If it is not reachable
  from an entry file, it does not belong in the entry.

## Step 8 — Verify before you finish

Every one of these has actually gone wrong here:

- **Boilerplate bullets.** Do not write "Bump dependencies" or "Migrated to TypeScript N"
  by pattern-matching earlier entries — check the `package.json` diff for the range first.
- **Exact old names.** Quote the field name the previous version really used
  (`borsh64SignedDelegation`, `wasmBytes`), not the one you half-remember.
- **Reachability.** Before citing a renamed type, confirm it appears in an entry file at
  one of the two revisions. `Native*` → `Nearcore*` touched dozens of files and belongs in
  no changelog, because none of those types were exported.
- **Draft outside the repo** (the scratchpad) and write the file in one pass. The working
  tree can be reset under you mid-task; a draft that lives only in the file you are editing
  is lost when that happens.
