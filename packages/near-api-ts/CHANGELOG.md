# Changelog

## [Unreleased 0.10.0]

### Added
- New standalone `signTransaction` / `safeSignTransaction` helper
  (`src/helpers/signTransaction`). Accepts
  `{ transaction, signDataProvider: { safeSignData } }` and returns a
  `SignedTransaction`, decoupling transaction signing from any specific key
  service — any object that implements `SafeSignData<TError>` (e.g.
  `MemoryKeyService`, a `KeyPair`, a future hardware-wallet service) can be
  passed as the `signDataProvider`.
- New public types for the helper: `SignTransaction`, `SafeSignTransaction`,
  `SignTransactionArgs<TSignDataError>`, and
  `SignTransactionPublicErrorRegistry` with codes
  `SignTransaction.Args.InvalidSchema` and `SignTransaction.Internal`
  (the underlying `signDataProvider` error is propagated through the result).
- `MemoryKeyService` now exposes `signData` / `safeSignData` for signing arbitrary
  byte payloads by `publicKey`, returning `Promise<SignedData>` with
  `{ curve, dataU8, signature, signatureU8 }`.
- `MemoryKeyService` now exposes `hasKey` / `safeHasKey` (`Promise<boolean>`) to
  check whether a public key is managed by the service.
- New error codes in `MemoryKeyServicePublicErrorRegistry`:
  `MemoryKeyService.SignData.Args.InvalidSchema`,
  `MemoryKeyService.SignData.SigningKey.NotFound`,
  `MemoryKeyService.SignData.Internal`,
  `MemoryKeyService.HasKey.Args.InvalidSchema`,
  `MemoryKeyService.HasKey.Internal`.
- New shared types `SignDataArgs`, `SignedData`, `SafeSignData<TError>`
  (`types/_common/signData`) used by every key-pair / key-service signer.

### Changed
- Migrated to TypeScript 6.
- `KeyPair` now exposes async `signData({ dataU8 })` / `safeSignData` instead of
  the previous synchronous `sign(u8Message)` / `safeSign`. The signed payload
  shape changed from `{ signature, curve, u8Signature }` to
  `{ curve, dataU8, signature, signatureU8 }`.
- The same `signData` / `safeSignData` shape is applied to `Ed25519KeyPair` and
  `Secp256k1KeyPair` returned from `randomEd25519KeyPair` /
  `randomSecp256k1KeyPair`.
- `keyPair` is now exported under its own name (previously re-exported as
  `throwableKeyPair as keyPair`).
- KeyPair error registry renamed accordingly:
  `KeyPair.Sign.Internal` → `KeyPair.SignData.Internal`
  (+ new `KeyPair.SignData.Args.InvalidSchema`);
  `Ed25519KeyPair.Sign.Internal` → `Ed25519KeyPair.SignData.Internal`
  (+ `Ed25519KeyPair.SignData.Args.InvalidSchema`);
  `Secp256k1KeyPair.Sign.Internal` → `Secp256k1KeyPair.SignData.Internal`
  (+ `Secp256k1KeyPair.SignData.Args.InvalidSchema`).
- Internal module paths for key-pair helpers moved from
  `src/helpers/keyPair/*` to `src/helpers/keyPairs/*`, and
  `createMemoryKeyService` now lives at
  `src/keyServices/memoryKeyService/memoryKeyService` (matters only for deep
  imports — the package root `near-api-ts` re-exports stay the same names).

### Fixed

### Removed
- `MemoryKeyService.signTransaction` / `safeSignTransaction` — transaction
  signing is no longer a method on the key service. Compose `safeSignData`
  with the standalone transaction-signing helper instead.
- `MemoryKeyService.findKeyPair` / `safeFindKeyPair` — replaced by `hasKey` /
  `safeHasKey`. The service no longer hands out raw `KeyPair` objects to
  callers.
- `MemoryKeyServiceBrand` symbol on the `MemoryKeyService` type.
- Error codes `MemoryKeyService.SignTransaction.*` and
  `MemoryKeyService.FindKeyPair.*` (replaced by the `SignData` / `HasKey`
  variants above).
- Global `Uint8Array` type augmentation that was previously side-effect-imported
  from the package entry point.
