---
name: module-placement
description: Decide where a module file belongs in packages/near-api-ts/*/src — which folder, whether to create a folder, and how deep into a `_common/` chain. Use when adding a new file, splitting a file that grew too big, moving/renaming a module, when a helper gains a second consumer, or when reviewing whether the file tree is correct.
---

# Module placement in `near-api-ts/*/src`

One file = one module = one primary export. Folder structure is derived mechanically from
the import graph — placement is not a matter of taste. Run the algorithm and you get
exactly one answer.

Scope: `packages/near-api-ts/universal/src`, and the sibling `nodejs/src`, `browser/src`.
`types/` and `tests/` do **not** follow this structure — never use them as evidence, and
do not "fix" them unless asked.

## Rule 0 — What counts as a consumer

Everything below depends on this definition. Get it wrong and every other rule
produces garbage.

A **consumer** of module M is a file that imports a *runtime value* from M **and lives in
`src/`**. Nothing else is a consumer:

- **`import type { X }` does not count.** Neither does `import { type X }` when every
  specifier is `type`-prefixed. Only value usage creates a structural dependency.
- **`index.ts` does not count.** It re-exports from any depth; being part of the public
  API says nothing about where a module belongs.
- **`tests/` and `types/` do not count.** Modules cannot be cleanly grouped across
  `src` / `types` / `tests`, so only `src`→`src` edges define the hierarchy.

Counting type-only edges inflates a module's consumer set and pushes it to the wrong
layer. When auditing, resolve each import and classify it before drawing conclusions.

## The four folder kinds

| Kind | How to recognize it | Encapsulation                                                                                                                                                |
|---|---|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Module folder** | Contains an **entry file** named after itself: `getBlock/getBlock.ts`, or the `create` form `cache/createCache.ts`, `toKeyPairs/toKeyPairs.ts` | Entry is visible to the parent scope. Every **other** file or folder in it is private to that folder.                                                        |
| **Group folder** | No entry file: `zodSchemas/`, `actions/`, `methods/`, `keyPairs/`, `sendRequest/` | **Transparent.** A naming device and nothing more — no encapsulation, members addressed individually. Obeys Rules 1–2 like any folder; may own a `_common/`. |
| **`_common/` layer** | Literally named `_common` | Shared modules owned by the folder **above the whole `_common` chain**.                                                                                      |
| **Feature root** | Direct child of `src/`: `createClient/`, `createSigner/`, `createMemoryKeyService/` | Top-level unit. Its entry file matches the folder name, like any module folder.                                                                              |

There is no further taxonomy. A group folder is not special — it does not exempt its
members from anything.

## Rule 1 — Ownership

Let `C` = the consumers of M, per Rule 0.

**`|C| == 0` → the module is free.** Nothing constrains it. Put it where it is cohesive,
i.e. beside the modules it belongs with conceptually. Public API entries usually land
here — that is fine, `index.ts` reaches any depth. A free module never pins a group in
place; it follows the group.

**`|C| == 1` → the module is private to that consumer.** Put it inside the consumer's
module folder. If the consumer is a bare file `D/foo.ts`, promote it to `D/foo/foo.ts`
and put the module beside it. *A file becomes a folder the moment it acquires its first
private helper — not before.*

**`|C| >= 2` → the module is shared.** Hoist it to a `_common/` of the lowest common
ancestor of `C`, at the depth Rule 2 gives.

The threshold is exactly two. One consumer never justifies `_common`; two always does.
The converse is a live check: **a folder sitting in `_common` with only one consumer is
misplaced** and must move into that consumer.

```
src/createClient/methods/account/
├── _common/transformAccessKey.ts        ← 2 consumers, LCA = account/
├── getAccountAccessKey/handleResult.ts  ← consumer 1
└── getAccountAccessKeys/handleResult.ts ← consumer 2
```

The folder's own entry counts as one of the two: `sendRequest/createSendRequest/_common/
getAvailableRpcs.ts` is used by `createSendRequest.ts` (the entry) and by
`handleMaybeUnknownBlock.ts` (a private sibling).

## Rule 2 — Layering

A chain `X/_common/_common/_common/` is **not** nesting-by-privacy. Every layer is owned
by `X`, visible to everything inside `X` — and to nothing outside `X`. Depth encodes how
foundational a module is:

> **layer(M) = 1 + the deepest layer that consumes M**

A regular (non-`_common`) module inside `X` is layer 0. Layer 1 serves layer 0, layer 2
serves layer 1, and so on. The invariant this produces:

> **A `_common` module never imports from an equal or shallower `_common` layer of the
> same owner.** The stack is a strict dependency ladder.

Worked example — owner `src/createClient/methods/transaction/`:

```
transaction/
├── getTransactionResult/ , sendSignedTransaction/            layer 0
└── _common/
    ├── getConversionSuccess.ts, getExecutionFailure.ts…      layer 1  ← used by layer 0
    ├── zodSchemas/rpc*.ts                                    layer 1  ← value consumers are layer 0
    └── _common/
        ├── getConversionStepSuccess.ts, getNonConversionSteps/   layer 2  ← used by layer 1
        └── _common/
            ├── getTransactionSummary.ts, getExecutionFailureError/   layer 3
            └── _common/
                └── getRawActionSummary.ts, getParsedActionSummary.ts  layer 4
                    ↑ consumed at layers 3 AND 2 → 1 + max = 4, not 1 + 2
```

Always take the **deepest** consumer. And note `zodSchemas/` sits at layer 1 because its
*value* consumers are at layer 0 — the many `import type { RpcTransactionSummary }` from
layers 1–3 are not consumers at all (Rule 0).

### Nesting does not add layers

The `_common` chain sets the layer **once**. Any folder inside that layer — module folder
or group folder — inherits it. Rule 2 decides where a *folder* goes; it says nothing
about the folder's interior, which is governed by Rule 1.

```
transaction/_common/_common/getNonConversionSteps/     ← layer 2, by Rule 2
├── getNonConversionSteps.ts                           ← entry
├── getReceiptsWithOutcomes.ts, getRefundSteps.ts      ← still layer 2, private by Rule 1
└── getExecutionSteps/getRawExecutionStep.ts           ← still layer 2
```

Do not compute a layer for a private member. It has no layer of its own.

### `_common` is never reached into

A member of `X/_common…` is invisible outside `X`. `unitConverter/` is a transparent
group, so `unitConverter/convertUnitsToDecimal.ts` is importable from outside — but
`unitConverter/_common/pow10.ts` is not, and never becomes so. If an outside module needs
`pow10`, you do not reach in: re-run the algorithm and the module is **hoisted out**
(there, to `src/_common/_common/_common/pow10.ts`).

## The algorithm

```
placeModule(M):
  1. C ← files in src/ that import a runtime VALUE from M
         (drop type-only imports, index.ts, tests/, types/)
  2. If |C| == 0 → free. Place with the modules it is cohesive with. STOP.
  3. If |C| == 1 → private to that consumer:
       consumer lives in module folder F → place M inside F
       consumer is a bare file D/foo.ts   → promote to D/foo/foo.ts, place M beside it
       STOP.
  4. X ← lowest common ancestor folder of C, with trailing `_common` segments stripped
  5. k ← max over c in C of (leading `_common` segments of c relative to X)
  6. Place M at  X + "/_common" repeated (k+1) times.
```

### When the consumer set changes

Re-run the algorithm. These moves are expected maintenance, not churn:

- A private helper gains a second consumer in a sibling subtree → **hoist** to `_common`
  at the new LCA.
- A shared module loses consumers down to one → **sink** it into that consumer. A
  `_common` folder with one consumer is a bug.
- A `_common` module starts being used by a module in its own layer → sink it **one
  layer deeper**, or Rule 2's invariant breaks.

Moving a module means rewriting every relative import path to it, in the same change.

## Naming

- File name == primary export name: `getAvailableRpcs.ts` exports `getAvailableRpcs`.
- Module-folder entry: `<folder>.ts`, or `create<Folder>.ts` when the export is a factory
  (`cache/createCache.ts`, `tasker/createTasker.ts`). Match the export.
- Feature roots are verb-prefixed factories (`createClient/`); group folders are nouns
  (`actions/`, `zodSchemas/`).

## Types are not modules

Never create a file for a type. These stay inline in the `src` file:

- local arg/error shapes — `type GetConversionFailureArgs = {…}`, `type GetXError = …`
- `z.infer<>` results beside their schema — `InnerTransaction`, `RpcTransactionSummary`
- types coupled to a runtime value — `NatError`, `ClientBrand`

Public, user-facing types live in `universal/types/`, which has its own (not yet
finalized) structure. Type imports never influence placement — see Rule 0.

## Reference: the `src/_common` primitive ladder

The deepest chain in the package. It is correct — do not flatten it:

```
src/_common/{nearGas,nearToken,repackError,convertObjectToU8}.ts   layer 1
src/_common/_common/{asThrowable,wrapInternalError}.ts             layer 2
src/_common/_common/_common/{result,constants}.ts                  layer 3
src/_common/_common/_common/_common/natError.ts                    layer 4
```

`natError` is the most-imported module in the package and sits at the *bottom* precisely
because everything depends on it — including `result`, which `wrapInternalError` consumes.
Depth means foundational, not obscure.

## Known deviation

Exactly one, and it is temporary:

- `signTransaction/zodSchemas/transaction.ts` and `signTransaction/signTransaction.ts`
  are imported by `createSigner/`. `signTransaction` will be consumed only through
  `createMemorySignService`. Do not restructure around this, and do not add new
  cross-feature imports like it.

`createMemorySignService/signTransaction/` as a whole is unfinished — do not treat
anything under it as precedent.

Everything else conforms (encapsulation 182/183, layering 36/36). A module that breaks a
rule is a bug, not precedent.

## Self-check

1. Did I classify every import correctly — value vs type-only — before counting consumers?
2. Does every module I touched sit where its consumer count puts it?
3. Did anything drop to one consumer? Sink it. Gain a second? Hoist it.
4. Does any `_common` module import from an equal-or-shallower layer of the same owner?
5. Did I compute a "layer" for a private member of a folder? That is not a thing.
6. Did I create a folder for a file with no private helpers? Undo it.
