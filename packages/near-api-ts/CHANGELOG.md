# Changelog

## [UNRELEASED] v0.11.0

### Added

### Changed

- Now empty `functionArgs` in
  `TransactionResult -> ActionSummary -> FunctionCall` returns as `null`
  instead of empty string.

### Removed

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
