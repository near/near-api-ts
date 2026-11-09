# Backlog

Open tasks, checked against the code on `main` at `243c9a6d` (2026-11-09). Each item says
what the code does today. TODO comments that belong to an item are linked from it. The rest
are under [From TODO comments in the code](#from-todo-comments-in-the-code) at the end.

## General

- [ ] **Enable `noUncheckedIndexedAccess`** for better type safety.
  Now: `near-api-ts/tsconfig.json` doesn't set it, and `react-near-ts/tsconfig.json` sets it
  to `false` explicitly.
- [ ] **Pick a format and a tool for the reference docs.** Candidates:
  - TypeDoc themes: https://typedoc.org/documents/Themes.html
  - typedoc-theme-oxide: https://balthild.github.io/typedoc-theme-oxide/
  - Example of the target style: https://near-sdk-js.gitbook.io/near-sdk-js
- [ ] **Restructure near-api-ts for subpath exports**, e.g. `import … from 'near-api-ts/actionCreators'`.
  Now: `package.json` exports only `.`, `./browser` and `./nodejs`.
- [ ] **Decide how the `@near-js/*` RPC packages are declared.** near-api-ts doesn't use
  `near-jsonrpc-client-ts`. It depends on `@near-js/jsonrpc-types@^1.9.0`, which has `zod ^4.0.5`
  as a regular dependency, while near-api-ts takes `zod` as a peer. Decide whether
  `jsonrpc-types` (or a future client package) should be a peer dependency.
- [ ] **Define the public type surface.** Decide which types near-api-ts exports publicly and
  which are only shared with react-near-ts.
  Now: `universal/index.ts` exports about 70 type names out of 91 type files. react-near-ts imports
  only from the `near-api-ts` root and re-exports all of it (`export * from 'near-api-ts'`).
  The two packages have no internal channel for sharing types.

## near-api-ts

### Actions

- [ ] **Add `UniversalStateInit`** (nearcore `DeterministicStateInit`).
  Now: unsupported. The transaction and delegation borsh schemas leave action slot 11 empty.
- [ ] **`CallContractFunctionAction.attachedDeposit`: always present**, defaulting to 0 in the
  creator instead of `undefined`.
  Now: optional, marked `// TODO fix it - Should be always present`. react-near-ts falls
  back to `0n` when it's missing.
- [ ] **`ActionsValidationError::FunctionCallEmptyMethodName`**: map it, or list it as unreachable.
  Now: not mapped. The creator's `ContractFunctionNameZodSchema` already rejects an empty name
  (`minLength(1)`), so the library probably can't send one. If so, it belongs on the
  "unreachable" list in `tests/.../conversion/action/action.test.ts`.

### Gas keys

- [ ] **Handle `GasKeyBalanceTooHigh`**, an `ActionErrorKind` with `{ accountId, publicKey, balance }`.
  Now: not mapped.
- [ ] **Map the conversion errors for signing with a gas key**: `InvalidNonceIndex`,
  `NotEnoughGasKeyBalance` and `NotEnoughBalanceForDeposit`.
  Now: unmapped, as the note in `tests/.../conversion/general/general.test.ts` says.
  The conversion errors for adding a gas key (`GasKeyInvalidNumNonces`,
  `AddGasKeyWithNonZeroBalance`, `GasKeyFunctionCallAllowanceNotAllowed`) can't be reached,
  because the `addAccessKey` creator rules them out. The comment in `action.test.ts` still
  gives the old reason ("none of which the library builds yet").
- [ ] **Sort out the `GasBudget` type.**
  Now: `GasBudget` / `GasBudgetArgs` are still exported, and the docs above them describe the
  old `gasBudget` field. They're used by react-near-ts `useNearSignIn` (`gasBudget`) and by the
  conversion error `Signer.AccessKey.GasBudget.NotEnough` (context `gasBudget`, with a
  `TODO: could have problems with GasBudget cuz GasKey?`). `AccessKey` and `addAccessKey`
  already call it `gasPayment.allowance`.
- [ ] **Real mainnet fixtures for protocol 85–86 legacy data**: actions and errors that 2.13
  accepted and 2.14 refuses (NEP-611 `DelegateV2`, a withdrawal inside a delegation,
  `RejectWithdrawFromGasKeyInDelegate`).
  Now: `getTransactionResult` reads all of them (`LegacyExecuteDelegation`,
  `LegacyWithdrawAccessKeyBalance`), but only unit tests with built inputs cover them. No real
  transaction is pinned. Check whether you can still create them, which depends on whether
  mainnet is past protocol 87 yet.

### Client

- [ ] **Add `client.fireSignedTransaction`.** Now: not there.
- [ ] **Add `client.awaitTransactionDetails`.**
  Now: `methods/transaction/awaitTransactionDetails/awaitTransactionDetails.ts` is a
  `// TODO Implement` stub and isn't wired into `createClient`.
- [ ] **Remove `Client.SendSignedTransaction.Rpc.Timeout`.** An RPC timeout should stay an
  inner error that triggers a retry, and the user should only see the client's own `.Timeout`.
  Now: still public, marked `// TODO Remove`.
- [ ] **Retry on `ShardStuck` / `ShardCongested` / `InvalidChain`.**
  Now: `sendWithRetry` retries only fetch failures and timeouts, `InnerRpc.Transaction.Timeout`,
  `InnerRpc.NotSynced` and `InnerRpc.Internal`. The conversion tests leave these three unmapped
  on purpose because they're transient.
- [ ] **Remove the remaining `Shard.NotTracked` errors.**
  Now: already gone from `getAccountInfo` and `callContractReadFunction`. Still present in
  `getAccessKey`, `getAccessKeys` and `getAccessKeyNonceChannels`, and the
  `getAccessKeyNonceChannels` entry in the v0.13.0 changelog lists it.
- [ ] **Return `actionIndex` + `executionStepId` on an `ExecutionFailure`.**
  Now: an `ExecutionFailure` carries only `error: { kind, context }`. The failed step can be
  found only by walking `executionSteps`.
- [ ] **Rework blocks and chunks.**
  Now: `getBlock` returns `{ rawRpcResult }` unchanged, and there's no chunk method.
  `Client.GetBlock.Rpc.Block.NotFound` has a `null` context. The TODO there is to parse the
  block id out of the error message
  ([getBlock/handleRpcError.ts:27](../packages/near-api-ts/universal/src/createClient/methods/block/getBlock/handleRpcError.ts#L27)).
- [ ] **Check the library against historical transactions (2020–2021).**
  Now: `tests/utils/transactionIndexer` has loaded failed mainnet transactions from 2020-07 to
  2022-01 into Postgres (see `logs/`). I found nothing that runs them through
  `getTransactionResult` or the deserializers yet. Its README still says
  `TODO - add instructions`.

### Utils

- [ ] **Rename `toEd25519CurveString` / `toSecp256k1CurveString` to `u8ToEd25519CurveString` /
  `u8ToSecp256k1CurveString`**, and `toMlDsa65CurveString` too, to match.
  Now: the old names are exported.
- [ ] **Accept a `string` in `GasInput`.**
  Now: `GasInput = bigint | number`, so `nearGas({ gas })` can't take a string. `teraGas` already
  takes one.
- [ ] **Add a method on `NearToken` / `NearGas` that truncates decimal places.**
  Now: none.
- [ ] **Add `equal` (plus `safeEqual`) to `NearToken` / `NearGas`.**
  Now: only `add`, `sub`, `gt` and `lt`.

### Signer

- [ ] **`allowedAccessKeys`: support `PublicKeyId` or drop the option.**
  Now: `keyPool.allowedAccessKeys: PublicKey[]` only, so an ml-dsa-65 key can't be named by
  the id an account lists it under.
- [ ] **Add `signer.fireTransaction`.** Now: not there.
- [ ] **Add `signer.submitTransaction`.**
  Now: there's only a sketch in `tests/_devOnly/yield.test.ts`.
- [ ] **Make the key pool follow the vault**: add keys to the pool, remove them, and revalidate
  access keys. This doesn't cover adding them on chain.
  Now: the pool reads keys once, and a new key needs a new signer. Because of that,
  `MemoryVault.addKeyPair` / `deleteKeyPair` were taken out until this exists. Each executor
  has a TODO for the case where a key was deleted from the vault:
  [executeTransaction.ts:66](../packages/near-api-ts/universal/src/createSigner/createTasker/executeTask/executors/executeTransaction.ts#L66),
  [signTransaction.ts:41](../packages/near-api-ts/universal/src/createSigner/createTasker/executeTask/executors/signTransaction.ts#L41),
  [signDelegation.ts:89](../packages/near-api-ts/universal/src/createSigner/createTasker/executeTask/executors/signDelegation.ts#L89).
- [ ] **Remove `Intent` from the public signer method types.**
  Now: `Signer.signTransaction: SignTransactionIntent // TODO remove Intent from public type`,
  and `signDelegation` is the same.

### Messages (NEP-413)

- [ ] **Add a `signMessage` helper.**
- [ ] **Add `signMessage` to the signer** (and the sign service it signs through).
- [ ] **Add `SignedMessageBorsh64`.** The message flow should be built around the encoded form,
  with JSON kept for debugging.
  Now: only `createMessage`, `verifyMessage` and `verifySignature` exist, and `SignedMessage` is
  JSON only.

### Vaults

- [ ] **`FileVault` (Node.js)**, built on the `Vault` contract
  (`safeHasKeyPair` / `safeGetPublicKey` / `safeSignData`):
  - [ ] `addKeyPair` (safe + throwing), synced with the signer
  - [ ] `removeKeyPair` (safe + throwing), synced with the signer
  - [ ] `hasKeyPair` (safe + throwing)
  - [ ] `clear` to remove every key (safe + throwing)

  Now: `nodejs/src/fileKeyService` is pre-refactor `KeyService` code, commented out of
  `nodejs/index.ts`. Its TODOs are worth carrying into the rewrite: drop a key from the
  cache on remove and clear the cache on `clear`
  ([removeKeyPair.ts:10](../packages/near-api-ts/nodejs/src/fileKeyService/public/removeKeyPair.ts#L10),
  [clear.ts:10](../packages/near-api-ts/nodejs/src/fileKeyService/public/clear.ts#L10)), and
  possibly sign asynchronously
  ([signTransaction.ts:45](../packages/near-api-ts/nodejs/src/fileKeyService/public/signTransaction.ts#L45)).
- [ ] **`IndexedDbVault` (browser)**, built on the same contract.
  Now: `browser/src/idbKeyService` is pre-refactor code with types, errors and manual tests,
  commented out of `browser/index.ts`. Playwright was started: `.gitignore` still has
  `browser/playwright-test-results`, but no package depends on Playwright any more. In the
  old code, `addKey`, `removeKey`, `clear` and `getKeyPair` fail with `false` until IndexedDB
  opens (`// TODO wait until idb is ready`), and `hasKey` is marked `// TODO rework`
  ([addKey.ts:6](../packages/near-api-ts/browser/src/idbKeyService/public/addKey.ts#L6),
  [removeKey.ts:7](../packages/near-api-ts/browser/src/idbKeyService/public/removeKey.ts#L7),
  [clear.ts:5](../packages/near-api-ts/browser/src/idbKeyService/public/clear.ts#L5),
  [getKeyPair.ts:11](../packages/near-api-ts/browser/src/idbKeyService/private/getKeyPair.ts#L11),
  [hasKey.ts:6](../packages/near-api-ts/browser/src/idbKeyService/public/hasKey.ts#L6)).
- [ ] **ML-DSA-65 secret keys** (follow-up to https://github.com/near/near-api-js/pull/2003).
  Now: the question is researched. near-api-ts accepts and generates only the 4032-byte
  expanded key, which matches nearcore 2.14 and near-cli-rs. Two things are left to decide:
  - accepting the 32-byte seed on import (NEPs#656, still an open amendment)
  - validating `tr` / `t0` of an expanded key: noble's `getPublicKey` ignores them, so a
    corrupted key imports and then every signature it makes fails.

### Research

- [ ] **Read the InclusionKey draft.** Now: the repo has nothing on it.

## react-near-ts

- [ ] **Align with near-api-ts, starting with `useNearSignIn`.**
  Now: the `AddFunctionCallKey` variant takes `contractAccountId` + `gasBudget: GasBudgetArgs`,
  but near-api-ts now uses `permission.allowedContract` + `gasPayment.allowance`.

---

## From TODO comments in the code

TODO comments that no item above covers. Links point at the comment's line on `243c9a6d`.

### near-api-ts: client

- [ ] **Drop the extra `tx` request in `sendSignedTransaction`** once nearcore's `send_tx`
  returns receipts. This waits on nearcore.
  Now: it sends `send_tx` (`wait_until: 'NONE'`) and `tx` in parallel to get the receipts
  ([sendSignedTransaction.ts:44](../packages/near-api-ts/universal/src/createClient/methods/transaction/sendSignedTransaction/sendSignedTransaction.ts#L44)).
- [ ] **Parse receipt outcome metadata v4.**
  Now: `version: 4` is accepted with no other fields, so its gas profile is dropped
  ([rpcReceiptOutcome.ts:38](../packages/near-api-ts/universal/src/createClient/methods/transaction/_common/zodSchemas/rpcTransactionDetails/rpcReceiptOutcome.ts#L38)).
- [ ] **Finish or delete `getGasPrice`, `getProtocolConfig` and `getContractState`.**
  Now: they exist under `createClient/methods/`, but nothing imports them and `Client` doesn't
  have them. `getGasPrice` has its args schema commented out (`// TODO use atMomentOf?`,
  [getGasPrice.ts:20](../packages/near-api-ts/universal/src/createClient/methods/protocol/getGasPrice.ts#L20)).
  `getProtocolConfig` uses a temporary schema "until 2.8.0"
  ([getProtocolConfig.ts:10](../packages/near-api-ts/universal/src/createClient/methods/protocol/getProtocolConfig.ts#L10)).
  Check whether `@near-js/jsonrpc-types` 1.9.0 makes it unnecessary.
- [ ] **Share the RPC error handling between `getAccessKey` and `getAccessKeys`**, and
  probably `getAccessKeyNonceChannels` too
  ([getAccessKey/handleRpcError.ts:6](../packages/near-api-ts/universal/src/createClient/methods/account/getAccessKey/handleRpcError.ts#L6),
  [getAccessKeys/handleRpcError.ts:6](../packages/near-api-ts/universal/src/createClient/methods/account/getAccessKeys/handleRpcError.ts#L6)).
- [ ] **`snakeToCamelCase`: leave keys that start with `_` / `__` alone**, and turn it into a
  general `convertObjectKeysCase`
  ([snakeToCamelCase.ts:1](../packages/near-api-ts/universal/src/createClient/createTransport/createSendRequest/_common/tryOneRound/sendWithRetry/sendOnce/snakeToCamelCase.ts#L1)).
- [ ] **`ExhaustedErrorContext`: move it to `_common`**, and consider adding the transport
  policy and the error of each attempt, not just `lastError`
  ([sendRequest.ts:32](../packages/near-api-ts/universal/types/client/transport/sendRequest.ts#L32)).

### near-api-ts: validation

- [ ] **Validate the public keys read from RPC with zod** instead of casting with
  `as PublicKey`. There are 8 places:
  - action summaries:
    [getRawActionSummary.ts:97](../packages/near-api-ts/universal/src/createClient/methods/transaction/_common/_common/_common/_common/getRawActionSummary/getRawActionSummary.ts#L97),
    [getRawDelegatedActionSummary.ts:134](../packages/near-api-ts/universal/src/createClient/methods/transaction/_common/_common/_common/_common/getRawActionSummary/getRawExecuteDelegationActionSummary/getRawDelegatedActionSummary.ts#L134),
    [getRawDeleteAccessKeyActionSummary.ts:6](../packages/near-api-ts/universal/src/createClient/methods/transaction/_common/_common/_common/_common/getRawActionSummary/_common/getRawDeleteAccessKeyActionSummary.ts#L6),
    [getRawStakeActionSummary.ts:8](../packages/near-api-ts/universal/src/createClient/methods/transaction/_common/_common/_common/_common/getRawActionSummary/_common/getRawStakeActionSummary.ts#L8),
    [getRawTopUpAccessKeyBalanceActionSummary.ts:10](../packages/near-api-ts/universal/src/createClient/methods/transaction/_common/_common/_common/_common/getRawActionSummary/_common/getRawTopUpAccessKeyBalanceActionSummary.ts#L10)
  - execution errors:
    [getExecutionFailureError.ts:98, 200, 217](../packages/near-api-ts/universal/src/createClient/methods/transaction/_common/_common/_common/getExecutionFailureError/getExecutionFailureError.ts#L98)

### near-api-ts: types and errors

- [ ] **Split the NatError kinds into inner and public**, so `isNatError` offers only public
  kinds. This goes with "Define the public type surface" under General
  ([natError.ts:43](../packages/near-api-ts/universal/types/_common/natError.ts#L43)).
- [ ] **Make `asThrowable` keep overloads**, then drop the `as any` on the throwing
  `callContractReadFunction` and `callContractFunction`
  ([asThrowable.ts:3](../packages/near-api-ts/universal/src/_common/_common/asThrowable.ts#L3),
  [createClient.ts:62](../packages/near-api-ts/universal/src/createClient/createClient.ts#L62),
  [callContractFunction.ts:104](../packages/near-api-ts/universal/src/transaction/actionCreators/callContractFunction.ts#L104)).
- [ ] **Type the signer's tasker without `any`**
  ([tasker.ts:7, 10](../packages/near-api-ts/universal/types/signer/inner/tasker.ts#L7),
  [createAddSignTransactionTask.ts:21](../packages/near-api-ts/universal/src/createSigner/createTaskQueue/taskCreators/createAddSignTransactionTask.ts#L21)).
- [ ] **Prefix the signer's inner task error types with `Inner`**
  ([taskQueue.ts:116](../packages/near-api-ts/universal/types/signer/inner/taskQueue.ts#L116)).
- [ ] **Naming: `Signer.AccessKey.AttachedDeposit.NotAllowed` → `AttachedPayment`?**
  ([conversionFailureError.ts:27](../packages/near-api-ts/universal/types/client/methods/transaction/_common/transactionDetails/_common/_common/conversionFailureError.ts#L27)).
- [ ] **Type the public helpers with `JsonValue` instead of `unknown`**: the input of
  `convertObjectToU8` and the output of `convertBase64ToObject`
  ([convertObjectToU8.ts:1](../packages/near-api-ts/universal/src/_common/convertObjectToU8.ts#L1),
  [base64ToObject.ts:3](../packages/near-api-ts/universal/src/createClient/methods/_common/base64ToObject.ts#L3)).
- [ ] **Rename `VerifySignatureArgs.message` to `dataU8`**: it's raw bytes, not a NEP-413
  message
  ([verifySignature.ts:13](../packages/near-api-ts/universal/types/_common/verifySignature.ts#L13)).

### near-api-ts: NearToken / NearGas

- [ ] **Move the Node.js `inspect` symbol out of the universal build** into the Node entry
  ([nearToken.ts:32](../packages/near-api-ts/universal/src/_common/nearToken.ts#L32),
  [nearGas.ts:32](../packages/near-api-ts/universal/src/_common/nearGas.ts#L32)).
- [ ] **Share the arithmetic method code** between the two, with fewer conversions on the way
  ([nearToken.ts:78](../packages/near-api-ts/universal/src/_common/nearToken.ts#L78),
  [nearGas.ts:77](../packages/near-api-ts/universal/src/_common/nearGas.ts#L77)).

### react-near-ts

- [ ] **Validate args** in the near-connect service, the store and the near-connect signer
  ([nearConnector.ts:6](../packages/react-near-ts/src/services/nearConnector/nearConnector.ts#L6),
  [nearStore.ts:8](../packages/react-near-ts/src/store/nearStore.ts#L8),
  [signMessage.ts:22](../packages/react-near-ts/src/services/nearConnector/createSigner/signMessage.ts#L22),
  [signDelegation.ts:19](../packages/react-near-ts/src/services/nearConnector/createSigner/signDelegation.ts#L19)).
- [ ] **`createNearStore`: refuse a service that's already registered**
  ([nearStore.ts:13](../packages/react-near-ts/src/store/nearStore.ts#L13)).
- [ ] **Add a react-near-ts error type (`ReactNearTsError`)** in place of a plain `Error`. It
  doesn't exist yet
  ([NearStoreProvider.tsx:14](../packages/react-near-ts/src/store/NearStoreProvider.tsx#L14)).
- [ ] **`signDelegation`: return a `SignedDelegation`** (the delegation and its signature),
  not just `{ signedDelegationBorsh64 }`
  ([signDelegation.ts:35](../packages/react-near-ts/src/services/nearConnector/createSigner/signDelegation.ts#L35),
  [useSignDelegation.ts:10](../packages/react-near-ts/types/hooks/useSignDelegation.ts#L10),
  [services/_common.ts:57](../packages/react-near-ts/types/services/_common.ts#L57)).
- [ ] **near-connect `signMessage`: parse the signature with
  `createNep413MessageSignatureZodSchema`** (already used in
  [withSignMessage.ts:26](../packages/react-near-ts/src/hooks/nearConnector/useNearSignIn/withSignMessage.ts#L26)),
  and return `messageBorsh64` plus the message tag. This goes with `SignedMessageBorsh64`
  under Messages
  ([signMessage.ts:41, 47](../packages/react-near-ts/src/services/nearConnector/createSigner/signMessage.ts#L41)).
- [ ] **`useExecuteTransaction`: fall back to the next signer when one fails.** The TODO ties
  this to every signer having `canExecuteTransaction`. Now: it skips a signer that can't
  execute, but throws the first failure. The near-connect signer has
  `canExecuteTransaction`, and the near-api-ts `Signer` doesn't
  ([useExecuteTransaction.ts:20](../packages/react-near-ts/src/hooks/useExecuteTransaction.ts#L20)).
- [ ] **Move `types/_common.ts` into `types/_common/`**
  ([types/_common.ts:9](../packages/react-near-ts/types/_common.ts#L9)).

### Stale TODOs to delete

- [ ] [toNearConnectActions.ts:153](../packages/react-near-ts/src/services/nearConnector/createSigner/_common/toNearConnectActions.ts#L153),
  "make sure that it will work only without a sponsor action": an `ExecuteDelegation` action
  already throws in `toNearConnectAction`, so this looks resolved.

