---
name: module-placement
description: Decide where a module file belongs in packages/near-api-ts/universal/src — which folder, whether to create a folder, and how deep into a `_common/` chain. Use when adding a new file, splitting a file that grew too big, moving/renaming a module, when a helper gains a second consumer, or when reviewing whether the file tree is correct.
---

# Module placement in `universal/src`

Folder structure is derived from the value-import graph. Placement is not a matter of
taste — but be precise about what "derived" covers:

- **Derived.** Which folder *owns* a module, and how deep in that owner's `_common` chain
  it sits. Run the algorithm and you get exactly one answer.
- **Chosen.** How that owning scope is subdivided for readability. `zodSchemas/`,
  `actions/`, `methods/` are group folders — a naming device the algorithm never emits and
  never forbids. Placing `getBlock/` at `methods/block/getBlock/` instead of directly in
  `createClient/` is a cohesion call, not a rule.

Get the derived part wrong and it is a bug. Get the chosen part wrong and it is a review
comment.

Scope: `packages/near-api-ts/universal/src`. `types/` and `tests/` do **not** follow this
structure — never use them as evidence, and do not "fix" them unless asked. `nodejs/src`
and `browser/src` are out of scope: they use a different convention and are unfinished.

Conformance is machine-checked — run `pnpm check:placement`. Never hand-maintain a count
in this file.

## Rule 0 — What counts as a consumer

Everything below depends on this definition. Get it wrong and every other rule
produces garbage.

A **consumer** of module M is a file that imports a *runtime value* from M **and lives in
`universal/src/`**. Nothing else is a consumer:

- **`import type { X }` does not count.** Neither does `import { type X }` when every
  specifier is `type`-prefixed. Only value usage creates a structural dependency.
- **`index.ts` does not count.** It re-exports from any depth; being part of the public
  API says nothing about where a module belongs.
- **`tests/` and `types/` do not count.** Modules cannot be cleanly grouped across
  `src` / `types` / `tests`, so only `src`→`src` edges define the hierarchy.

Counting type-only edges inflates a module's consumer set and pushes it to the wrong
layer. When auditing, resolve each import and classify it before drawing conclusions.

**A `src` module never imports from the package `index.ts`.** A barrel import hides a
value edge from this algorithm and routes around `_common` encapsulation. Import the
module directly, however long the relative path is.

## The three folder kinds

| Kind | How to recognize it | Encapsulation |
|---|---|---|
| **Module folder** | Contains an **entry file** with the folder's own name: `getBlock/getBlock.ts`, `createCache/createCache.ts` | Entry is visible to the parent scope. Every **other** file or folder in it is private to that folder. |
| **Group folder** | No entry file: `zodSchemas/`, `actions/`, `methods/`, `keyPairs/` | **Transparent.** A naming device and nothing more — no encapsulation, members addressed individually. Obeys Rules 1–2 like any folder; may own a `_common/`. |
| **`_common/` layer** | Literally named `_common` | Shared modules owned by the folder **above the whole `_common` chain**. |

There is no further taxonomy. A group folder is not special — it does not exempt its
members from anything.

**Feature root is an attribute, not a kind.** A direct child of `src/` (`createClient/`,
`createSigner/`, `offchainMessage/`, …) is *pinned*: Rules 1–2 never relocate it or its
entry, whatever its consumer count says. A value import that crosses from one feature root
into another is a coupling question, not a placement question — justify it or delete it.

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
The converse is a live check: **a module sitting in `_common` with only one consumer is
misplaced** and must move into that consumer.

```
src/createClient/methods/account/
├── _common/transformAccessKey.ts        ← 2 consumers, LCA = account/
├── getAccountAccessKey/handleResult.ts  ← consumer 1
└── getAccountAccessKeys/handleResult.ts ← consumer 2
```

The folder's own entry counts as one of the two: `createSendRequest/_common/
getAvailableRpcs.ts` is used by `createSendRequest.ts` (the entry) and by
`handleMaybeUnknownBlock.ts` (a private sibling).

### The unit that moves

Placement moves a **unit**, not always a file:

- M is the entry of module folder F → **the unit is F**, with everything inside it.
  Consumers that live inside F do not count; they are internal.
- Otherwise the unit is the file itself.

Without this, "place M inside the consumer" would tear an entry away from its own private
helpers and silently turn a module folder into a group folder.

## Rule 2 — Layering

A chain `X/_common/_common/_common/` is **not** nesting-by-privacy. Every layer is owned
by `X`, visible to everything inside `X` — and to nothing outside `X`. Depth encodes how
foundational a module is:

> **layer(M) = 1 + the deepest layer that consumes M**

A regular (non-`_common`) module inside `X` is layer 0. Layer 1 serves layer 0, layer 2
serves layer 1, and so on. The invariant this produces:

> **A `_common` module never imports from an equal or shallower `_common` layer of the
> same owner.** The stack is a strict dependency ladder.

### Which modules have a layer

A module has a layer **only if walking up from it through *group* folders reaches a
`_common` directory**. `_common/zodSchemas/foo.ts` has one (`zodSchemas/` is transparent);
`_common/getNonConversionSteps/getRefundSteps.ts` does not — it is a private member of a
module folder.

A private member has no layer of its own. It **inherits** its enclosing `_common` layer,
and is scored at that inherited layer when it turns up in someone else's consumer set.
The invariant above is checked over the modules that have a layer.

Worked example — owner `src/createClient/methods/transaction/`:

```
transaction/
├── getTransactionResult/ , sendSignedTransaction/            layer 0
└── _common/
    ├── getExecutionFailure.ts, getExecutionSuccess.ts…       layer 1  ← used by layer 0
    └── _common/
        ├── getConversionStepSuccess.ts, getNonConversionSteps/   layer 2  ← used by layer 1
        └── _common/
            ├── getTransactionSummary.ts, getExecutionFailureError/   layer 3
            └── _common/
                └── getRawActionSummary.ts, getParsedActionSummary.ts  layer 4
                    ↑ consumed at layers 3 AND 2 → 1 + max = 4, not 1 + 2
```

Always take the **deepest** consumer.

And note how the `rpc*` zod schemas split, because Rule 1 runs before Rule 2.
`rpcActionReceipt.ts`, `rpcReceiptOutcome.ts` and `rpcTransactionSummary.ts` have exactly
one value consumer — `rpcTransactionDetails.ts` — so they are private members of
`_common/zodSchemas/rpcTransactionDetails/` and never get a layer at all, however many
modules `import type` from them. `rpcTransactionOutcome.ts` is the one with real value
consumers across the tree, which is why it alone earns a layer (2, above). Type edges are
not consumers (Rule 0), so they cannot hold a module up at a layer.

### Nesting does not add layers

The `_common` chain sets the layer **once**. Any folder inside that layer — module folder
or group folder — inherits it. Rule 2 decides where a *folder* goes; it says nothing
about the folder's interior, which is governed by Rule 1.

```
transaction/_common/_common/getNonConversionSteps/     ← layer 2, by Rule 2
├── getNonConversionSteps.ts                           ← entry
├── getReceiptsWithOutcomes.ts, getRefundSteps.ts      ← private by Rule 1, layer 2 inherited
└── getExecutionSteps/getRawExecutionStep.ts           ← same
```

### `_common` is never reached into

A member of `X/_common…` is invisible outside `X`. `unitConverter/` is a transparent
group, so `unitConverter/convertUnitsToDecimal.ts` is importable from outside — but
`unitConverter/_common/pow10.ts` is not, and never becomes so. If an outside module needs
`pow10`, you do not reach in: re-run the algorithm and the module is **hoisted out**
(there, to `src/_common/_common/_common/pow10.ts`).

## The algorithm

```
placeModule(M):
  0. If M is a feature root or the entry of one → pinned. STOP.
     If M is the entry of module folder F → the unit is F; consumers inside F don't count.
  1. C ← files in universal/src/ that import a runtime VALUE from M
         (drop type-only imports, index.ts, tests/, types/)
  2. If |C| == 0 → free. Place with the modules it is cohesive with. STOP.
  3. If |C| == 1 → private to that consumer:
       consumer lives in module folder F → place the unit inside F
       consumer is a bare file D/foo.ts   → promote to D/foo/foo.ts, place it beside it
       STOP.
  4. X ← lowest common ancestor folder of C, with trailing `_common` segments stripped
  5. k ← max over c in C of (leading `_common` segments of c relative to X)
  6. Place the unit at  X + "/_common" repeated (k+1) times.
```

Step 3 names a *subtree*, not a directory: anywhere inside F is legal, and which group
folder you land in is the "chosen" half from the top of this document.

### It is a fixpoint, not a one-shot

Step 5 measures where consumers *currently* sit, and step 3 moves them. So a move can
change `k` for a module whose own consumer set never changed. Re-run until nothing moves.

Triggers, all of them expected maintenance rather than churn:

- A private helper gains a second consumer in a sibling subtree → **hoist** to `_common`
  at the new LCA.
- A shared module loses consumers down to one → **sink** it into that consumer.
- A `_common` module starts being used by a module in its own layer → sink it **one
  layer deeper**, or Rule 2's invariant breaks.
- A consumer moved to a different `_common` depth → recompute step 5 for everything it
  imports.

Moving a module means rewriting every relative import path to it, in the same change.

## Naming

- File name == the stem of its exports: `getAvailableRpcs.ts` exports `getAvailableRpcs`.
- A module may export a **closed family sharing one stem** — `safe<Name>` /
  `throwable<Name>`, `<Name>ZodSchema`, `create<Name>` / `createSafe<Name>`, and the
  `z.infer` types beside them. `transfer.ts` exporting `safeTransfer` +
  `throwableTransfer` + `CreateTransferActionArgsSchema` is one module.
- **A file whose exports share no stem is two modules — split it.** `keyUtils.ts`
  exporting `createLock` + `createUnlock` + `createSetNonce` is three files.
- **Module-folder entry: `<folder>.ts`, always.** The folder carries the entry's own name,
  factory or not — `createCache/createCache.ts`, `createTasker/createTasker.ts`,
  `getBlock/getBlock.ts`. Never `cache/createCache.ts`: a folder whose name differs from
  its entry reads as a group folder in the tree, and you have to open it to find out
  otherwise. `pnpm check:placement` accepts the old `create<Folder>.ts` form, so it will
  not catch a regression here — this one is on review.
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

`createMemorySignService/` has no entry file yet, so it is currently a group folder rather
than a feature root. Two consequences, both temporary:

- `signTransaction/zodSchemas/transaction/transaction.ts` exports `TransactionIntentZodSchema`,
  which `createSigner/createSignTransaction.ts` and `createSigner/createExecuteTransaction.ts`
  import. That reaches into `signTransaction/`'s private interior — the only illegal edges
  in the package.
- `signTransaction/signTransaction.ts` is consumed by two modules in
  `createSigner/createTasker/executeTask/executors/`, so the algorithm would move the whole
  `signTransaction/` folder under `executors/_common/`.

Both close the same way: give `createMemorySignService/` its entry factory and have
`createSigner` consume that instead of reaching in. Until then, do not restructure around
these two, and do not add new cross-feature imports like them.

## Self-check

1. Did I classify every import as value vs type-only *before* counting consumers?
2. Did I rewrite every relative import path to the modules I moved, in the same change?
3. Did I re-run `pnpm check:placement` and get the same finding count I started with?
