# Changelog

## [UNRELEASED] v0.12.0

### Added

- **Meta transactions (delegations)** – a delegator signs a set of actions, and a
  relayer pays for them and sends them on chain.

  - New standalone `signDelegation` / `safeSignDelegation` helper.
    Accepts `{ delegation, signDataProvider: { safeSignData } }` – the same
    `signDataProvider` contract as `signTransaction`, so a `KeyPair`,
    a `MemoryKeyService` or any object exposing `safeSignData` can sign – and
    returns `{ signedDelegation, signedDelegationBorsh64 }`.

    ```ts
    const signedDelegation = await signDelegation({
      delegation: {
        delegatorAccountId: 'alice.testnet',
        delegatorPublicKey: aliceKeyPair.publicKey,
        receiverAccountId: 'contract.testnet',
        nonce: accessKey.nonce + 1,
        expiration: { blockHeight: blockHeight + 100 },
        delegatedAction: functionCall({ ... }),
      },
      signDataProvider: aliceKeyPair,
    });
    ```

  - New `executeDelegation` / `safeExecuteDelegation` action creator – the action
    a relayer wraps a signed delegation into. It accepts
    `{ signedDelegationBorsh64 }`, so the whole `signDelegation` output can be
    passed into it as is. The relayer's transaction `receiverAccountId` must be
    the delegator's account id.

    ```ts
    const signedTransaction = await signTransaction({
      transaction: {
        signerAccountId: 'relay.testnet',
        ...
        receiverAccountId: 'alice.testnet', // the delegator, not the delegation receiver
        actions: [executeDelegation(signedDelegation)],
      },
      signDataProvider: relayKeyPair,
    });
    ```

  - New types `DelegableAction`, `DelegationBase`, `SingleDelegableAction`,
    `MultiDelegableActions`, `ExecuteDelegationAction`, `SignDelegationOutput`.
  - `getTransactionResult` / `sendSignedTransaction` summarize an
    `ExecuteDelegation` action, including the summaries of the actions nested in
    the delegation.
  - New execution errors: `Action.ExecuteDelegation.Expired`,
    `.Signature.Invalid`, `.Nonce.Invalid`, `.Nonce.TooLarge`,
    `.Executor.NotAllowed` and the `.Delegator.AccessKey.*` block
    (`NotFound`, `NotFullAccess`, `AttachedDeposit.NotAllowed`,
    `Receiver.NotAllowed`, `Function.NotAllowed`).

- **Global contracts** – publish a wasm once and let many accounts run it without
  paying for its storage.

  - `registerPinnableGlobalContract` / `safeRegisterPinnableGlobalContract` –
    `{ wasmU8 | wasmBase64 }`. The immutable contract is addressed by the hash of
    its wasm and can be adopted with `pinGlobalContract`.
  - `registerLinkableGlobalContract` / `safeRegisterLinkableGlobalContract` –
    `{ wasmU8 | wasmBase64 }`. The replaceable contract is addressed by the
    account id that registered it and can be adopted with `linkGlobalContract`.
  - `pinGlobalContract` / `safePinGlobalContract` –
    `{ globalContractWasmHash }`. The account runs that exact wasm, and nobody can
    swap the code under it.
  - `linkGlobalContract` / `safeLinkGlobalContract` –
    `{ globalContractAccountId }`. The account follows whatever code the registrar
    currently holds, so it picks up every re-registration.
  - New types `RegisterPinnableGlobalContractAction`,
    `RegisterLinkableGlobalContractAction`, `PinGlobalContractAction` and
    `LinkGlobalContractAction`.
  - New execution errors
    `Action.PinGlobalContract.GlobalContract.NotFound` and
    `Action.LinkGlobalContract.GlobalContract.NotFound`.
  - Registering is asynchronous – the code becomes usable a block or so after the
    register transaction succeeds, so a pin/link sent right away can fail with the
    errors above.

- New conversion errors. A transaction turned down by the node no longer falls
  through to `Internal` in these cases:
  - Access key checks: `Signer.AccessKey.NotFound`, `.NotFullAccess`,
    `.Receiver.NotAllowed`, `.Function.NotAllowed`,
    `.AttachedDeposit.NotAllowed`, `.GasBudget.NotEnough`.
  - Action set limits: `Actions.TooMany`, `Actions.DeployContract.TooMany`,
    `Actions.ExecuteDelegation.TooMany`,
    `Actions.FunctionCall.TotalGasLimit.Exceeded`,
    `Actions.FunctionCall.TotalGasLimit.Overflow`.
  - Single action validation: `Action.FunctionCall.FunctionName.TooLong`,
    `Action.FunctionCall.ZeroGasLimit`,
    `Action.AddKey.AllowedFunctions.FunctionName.TooLong`,
    `Action.AddKey.AllowedFunctions.TotalSize.Exceeded`,
    `Action.Stake.ValidatorKey.Invalid`, `Action.DeleteAccount.NotFinal`.
  - `TransactionCost.Overflow`.

  As before, each of them is surfaced by `client.sendSignedTransaction` as
  `Client.SendSignedTransaction.Rpc.<kind>` and by `client.getTransactionResult`
  as a `ConversionError`.

- New type `AccountContract` – the `contract` field of `getAccountInfo` output.
- `constants.TeraGasDecimals` and `constants.Nep366MetaTransaction`.

### Changed

- Rework `signTransaction` output. `signTransaction` / `safeSignTransaction` and
  `signer.signTransaction` / `safeSignTransaction` now return
  `SignTransactionOutput`:  \
  Previously:
  ```ts
  // SignedTransaction
  { transactionHash, transaction, signature, signedTransactionBorsh64 }
  ```

  Now:
  ```ts
  // SignTransactionOutput
  { transactionHash, signedTransaction: { transaction, signature }, signedTransactionBorsh64 }
  ```

  Passing the output into `client.sendSignedTransaction({ signedTransaction })`
  keeps working unchanged – only reading `transaction` / `signature` off it needs
  the extra `signedTransaction` hop. `SignedTransaction` is now just
  `{ transaction, signature }`, and its `transaction.actions` is always the
  normalized action list, even when the transaction was built with a single
  `action`.

- Rework `client.getAccountInfo` contract fields:  \
  Previously:
  ```ts
  {
    contractWasmHash: CryptoHash | null,
    globalContractWasmHash: CryptoHash | null,
    globalContractAccountId: AccountId | null,
  }
  ```

  Now – a single discriminated union on `contract.status`:
  ```ts
  {
    contract:
      | { status: 'NoContract' }
      | { status: 'Deployed'; localContractWasmHash: ContractWasmHash }
      | { status: 'Pinned'; globalContractWasmHash: ContractWasmHash }
      | { status: 'Linked'; globalContractAccountId: AccountId },
  }
  ```

  This also fixes the inverted check behind the old `contractWasmHash`: an account
  with a deployed contract returned `null`, and an account without one returned
  the placeholder hash.

- Rename the `deployContract` wasm argument and the produced action field
  `wasmBytes` → `wasmU8`. `wasmBase64` is unchanged.

- `safeSignTransaction` no longer leaks the signer's own error into its error
  union. A failing `signDataProvider.safeSignData` is now wrapped as
  `SignTransaction.SignData.Failed`, with the original error under
  `context.cause` – so every failure of the helper is a `NatError` and
  `isNatError` covers all of them.

- Rename conversion error kinds:
  - `Signer.NotEnoughBalance` → `Signer.Budget.NotEnough`;
    its context changed from `{ signerAccountId, transactionCost }` to
    `{ signerAccountId, minimalMissingAmount }`
  - `Expired` → `BlockHash.Expired`

- Rename execution error kinds:
  - `Executor.NotEnoughBalance` → `Executor.Budget.NotEnough`;
    its context field `missingAmount` → `minimalMissingAmount`
  - `Action.Stake.BelowThreshold` → `Action.Stake.ProposedStake.BelowThreshold`
  - `Action.Stake.NotEnoughBalance` → `Action.Stake.TotalBalance.NotEnough`
  - `Action.Stake.NotFound` → `Action.Stake.ValidatorStake.AlreadyZero`

  The renames propagate to every kind built on top of them, e.g.
  `MemorySigner.ExecuteTransaction.Rpc.Signer.NotEnoughBalance` →
  `MemorySigner.ExecuteTransaction.Rpc.Signer.Budget.NotEnough` and
  `Client.SendSignedTransaction.Rpc.Action.Stake.NotFound` →
  `Client.SendSignedTransaction.Rpc.Action.Stake.ValidatorStake.AlreadyZero`.

- Rename the `producedSteps` discriminator in an execution step:
  `producedSteps[].kind` → `producedSteps[].stepType`
  (`{ stepType: 'Execution' | 'Refund' }`).

- Rename type `Action` → `TransactionAction`. Alongside the previous actions it
  now also includes `ExecuteDelegationAction`,
  `RegisterPinnableGlobalContractAction`,
  `RegisterLinkableGlobalContractAction`, `LinkGlobalContractAction` and
  `PinGlobalContractAction` – code that switches exhaustively over an action or
  over an action summary has new branches to handle.

- Rework the delegation types. Type `Delegation` was replaced by `DelegationBase`,
  which is combined with `SingleDelegableAction` / `MultiDelegableActions`:
  - `senderAccountId` → `delegatorAccountId`
  - `senderPublicKey` → `delegatorPublicKey`
  - `action` / `actions` → `delegatedAction` / `delegatedActions`
  - `expiration: { blockHeight } | { blockOffset }` → `expiration: { blockHeight }`
  - `blockHash` removed – a delegation expires by block height only

  `DelegationIntent` picks up the last two of those – `delegatedAction` /
  `delegatedActions` and the narrowed `expiration` – and keeps its
  `receiverAccountId`; the delegator, nonce and block fields were never on it.
  `SignedDelegation` is now
  `{ delegation, signature }` – its `borsh64SignedDelegation` field moved out to
  `SignDelegationOutput.signedDelegationBorsh64` – and its `delegation` always
  carries the normalized `delegatedActions` list plus the NEP-366 `tag` the
  signature was made over.

- Rename helper `objectToU8` → `convertObjectToU8`.
- Rename helper `base64ToObject` → `convertBase64ToObject`.

- Rename the Node.js entry point `near-api-ts/node` → `near-api-ts/nodejs`.
  The bare `near-api-ts` import resolves to it automatically and does not need to
  be changed.

### Removed

- Helper `u8ToObject` – decode the bytes yourself
  (`JSON.parse(new TextDecoder().decode(u8))`), or use `convertBase64ToObject`
  when you have a base64 string.
- Type `Action` – renamed to `TransactionAction`.
- Type `Delegation` – replaced by `DelegationBase`.
- The internal brand symbol on the `Client` type.

---

## v0.11.0

### Added

- Support for ML-DSA-65 cryptography
- `base64ToObject` utility function
- Helper `signTransaction` now returns `SignedTransaction` with `signedTransactionBorsh64`
- Improve lib's tree-shaking


### Changed

- Improve `client.getTransactionResult` structure and types

- Rework `client.sendSignedTransaction` structure and types
  - `signer.executeTransaction` returns the output of `client.sendSignedTransaction` -
    so it changed as well

- Rework `client.callContractReadFunction`:  \
  Previously:
  - `options.deserializeResult` accepts `rawResult: number[]` as an argument;
  - If the default `deserializeResult` failed to parse a raw result as JSON it
    returns
    error
    `Client.CallContractReadFunction.ResultDeserialization.JsonParseFailed`
  - Returns `{  blockHash, blockHeight, result, rawResult, logs }`
  - Has `.Shard.NotTracked` + `NotSynced` errors
  - When no account found – returns `Internal` error

  Now
  - `options.deserializeResult` accepts `rawResult: Base64String` as an
    argument;
  - If the default `deserializeResult` failed to parse a raw result as JSON it
    returns a raw result as base64 or null
  - Returns `{  result, logs, withStateAt: { blockHash, blockHeight } }`
  - Removed `.Shard.NotTracked` + `NotSynced` errors - will end up as `Internal`
  - When no account found – returns `.Rpc.Account.NotFound` error

- Rename helper `toJsonBytes` to `objectToU8`
- Rename helper `fromJsonBytes` to `u8ToObject`
- Added `signedTransactionBorsh64` to type `SignedTransaction`
- Migrated to TypeScript 7
- Bump dependencies

---

## v0.10.0

### Added

- New `client.getTransactionResult` method –
  fully reworked nearcore API for transaction status. Given a `transactionHash`,
  it returns a structured `TransactionResult`: a discriminated union on
  `result.status`:
  - `Success` – `result.data` holds the returned value (raw `unknown`, or the
    return type of optional `deserializeResultData`), alongside
    `processingSteps` (`conversionStep`, `executionSteps`, `refundSteps`).
  - `ConversionError` – the transaction failed to convert into receipt;
  - `ExecutionError` – the transaction failed during execution;

  Also, `getTransactionResult` accepts optional deserializers –
  `deserializeResultData`, `deserializeActionSummaries`,
  `deserializeExecutionSteps` – you can type the unknown result.

- New standalone `signTransaction` helper
  Accepts `{ transaction, signDataProvider: { safeSignData } }` and returns a
  `SignedTransaction`, decoupling transaction signing from any specific key
  service — any object exposing a `safeSignData` method (e.g.
  `MemoryKeyService`, a `KeyPair`, a future hardware-wallet service) can be
  passed as the `signDataProvider`.

- `MemoryKeyService` now exposes `signData`.

- `MemoryKeyService` now exposes `hasKey` to
  check whether a public key is managed by the service.

- Added type `GasLimitArgs` for previous behavior of `GasBudget` type.
  Use `GasLimitArgs` when you need to create functionCall key.

### Changed

- Migrated to TypeScript 6.
- Bump dependencies.
-
- **Breaking:** `getAccountInfo` output (`GetAccountInfoOutput`) was
  restructured.
  It is now:
  ```
  {
    accountId,
    balance: { total, available, locked: { total, validatorStake, storageDeposit } },
    usedStorageBytes,
    contractWasmHash: CryptoHash | null,
    globalContractWasmHash: CryptoHash | null,
    globalContractAccountId: AccountId | null,
    atMomentOf: { blockHash, blockHeight },
  }
  ```
  Previously balance/storage/contract fields were nested under `accountInfo`,
  `locked` was `{ amount, breakdown: { validatorStake, storageDeposit } }`,
  block
  info was top-level `blockHash` / `blockHeight`, and contract fields were the
  optional `contractHash?` / `globalContractHash?`. The `rawRpcResult` field was
  removed, and the `Client.GetAccountInfo.Rpc.Shard.NotTracked` error code was
  removed.

- **Breaking:** Zod schema exports renamed `*Schema` → `*ZodSchema`:
  `AccountIdSchema` → `AccountIdZodSchema`,
  `Base64StringSchema` → `Base64StringZodSchema`,
  `PublicKeySchema` → `PublicKeyZodSchema`,
  `MessageSchema` → `MessageZodSchema`.

- **Breaking:** `GasBudget` (function-call access keys) changed from
  `'Unlimited' | NearTokenArgs` to `'Unlimited' | NearToken`.

- **Breaking:** `KeyPair` now exposes async `signData({ dataU8 })` /
  `safeSignData` instead of
  the previous synchronous `sign(u8Message)` / `safeSign`. The signed payload
  shape changed from `{ signature, curve, u8Signature }` to
  `{ curve, dataU8, signature, signatureU8 }`.
  The same `signData` / `safeSignData` shape is applied to `Ed25519KeyPair` and
  `Secp256k1KeyPair` returned from `randomEd25519KeyPair` /
  `randomSecp256k1KeyPair`.
- **Breaking:** `GasBudget` now accepts `'Unlimited' | NearTokenArgs` instead
  of `'Unlimited' | NearToken`. For previous behavior, use `GasLimitArgs`

### Removed

- `MemoryKeyService.signTransaction` / `safeSignTransaction` — transaction
  signing is no longer a method on the key service. Compose `safeSignData`
  with the standalone transaction-signing helper instead.
- `MemoryKeyService.findKeyPair` / `safeFindKeyPair` — replaced by `hasKey` /
  `safeHasKey`. The service no longer hands out raw `KeyPair` objects to
  callers.
- `MemoryKeyServiceBrand` symbol on the `MemoryKeyService` type.
- Global `Uint8Array` type augmentation that was previously side-effect-imported
  from the package entry point.
