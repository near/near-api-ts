# Changelog

## v0.6.0

### Added

- Everything near-api-ts v0.13.0 adds is re-exported from this package as well –
  the `PublicKeyId` type and `publicKeyId` on every key pair, the `NearGas` type,
  `createVaultSignService` and the `Vault`, `SignService` and `SignerClient`
  contracts, the memory vault's `getPublicKey`, the `minimalProcessingStage`
  and `options` of a signer's
  `executeTransaction`, a signer's `signDelegation`, and
  `cache.recentBlockHash.ttlMs` in `createClient`. See the near-api-ts changelog.

- The gas key actions `topUpAccessKeyBalance` / `withdrawAccessKeyBalance` are
  re-exported from near-api-ts too. The near-connect signer throws for both –
  near-connect has no format for them.

### Changed

- **Breaking:** `useSignDelegation` takes the intent without `expiration`. A
  near-connect wallet picks the expiration and the nonce of a delegation
  itself, so `expiration` is optional now and the near-connect signer refuses an
  intent that has one – it used to drop it without a word:  \
  Previously:
  ```ts
  signDelegation({ intent: { delegatedAction, receiverAccountId, expiration: { blockHeight } } });
  ```

  Now:
  ```ts
  signDelegation({ intent: { delegatedAction, receiverAccountId } });
  ```

  The re-exported `DelegationIntent` takes `expiration: { inBlocks }` as well;
  see the near-api-ts v0.13.0 changelog.

- **Breaking:** the access key API re-exported from near-api-ts drops the
  `Account` prefix: `AccountAccessKey` is now `AccessKey`, and the client methods
  `getAccountAccessKey` / `getAccountAccessKeys` are now `getAccessKey` /
  `getAccessKeys`, returning `accessKey` / `accessKeys`. See the near-api-ts
  v0.13.0 changelog for the full list, error kinds included.

- **Breaking:** `AccessKey`, re-exported from near-api-ts, refers to the key by
  `publicKeyId` instead of `publicKey`. See the near-api-ts v0.13.0 changelog.

- **Breaking:** the action creators `addFullAccessKey` and `addFunctionCallKey`,
  re-exported from near-api-ts, are replaced by `addAccessKey`, and the action
  they created has a new shape, `actionType: 'AddKey'` included – it is
  `'AddAccessKey'` now, and so are the `Action.AddKey.*` error kinds. See the
  near-api-ts v0.13.0 changelog. The near-connect signer passes the action on to
  the wallet as before, but throws for a gas key (`gasPayment.source:
  'KeyBalance'`) – near-connect has no format for it.

- **Breaking:** the action creators re-exported from near-api-ts
  `deployContract`, `deleteKey`, `registerPinnableGlobalContract` and
  `registerLinkableGlobalContract` are renamed to `deployLocalContract`,
  `deleteAccessKey`, `publishPinnableGlobalContract` and
  `publishLinkableGlobalContract`, and so are their `safe*` variants, the
  `actionType` of the actions they create and their error kinds;
  `Actions.DeployContract.TooMany` is now `Actions.UploadContract.TooMany`. See
  the near-api-ts v0.13.0 changelog. The near-connect signer passes the actions
  on to the wallet as before.

- **Breaking:** the action creator `createAccount`, re-exported from near-api-ts,
  is renamed to `createSubAccount`, and so are the `actionType` of the action it
  creates and the `Action.CreateAccount.*` error kinds – they are
  `Action.CreateSubAccount.*` now. See the near-api-ts v0.13.0 changelog. The
  near-connect signer passes the action on to the wallet as before.

- **Breaking:** the action creator `functionCall`, re-exported from near-api-ts,
  is renamed to `callContractFunction`, and so are `safeFunctionCall`, the
  `FunctionCallAction` type, the `actionType` of the action it creates and the
  `Action.FunctionCall.*`, `Actions.FunctionCall.*` and
  `CreateAction.FunctionCall.*` error kinds – the `FunctionCall` segment is
  `CallContractFunction` now. See the near-api-ts v0.13.0 changelog. The
  near-connect signer passes the action on to the wallet as before.

- **Breaking:** the memory key service and the memory signer re-exported from
  near-api-ts are replaced by a memory vault, a vault sign service and a signer:
  `createMemoryKeyService` / `safeCreateMemoryKeyService` → `createMemoryVault` /
  `safeCreateMemoryVault`, `MemoryKeyService` → `MemoryVault`,
  `createMemorySigner` / `safeCreateMemorySigner` → `createSigner` /
  `safeCreateSigner`, `MemorySigner` → `Signer`, whose argument `keyService` →
  `signService` – a sign service from `createVaultSignService({ vault })` – and
  the error kinds `CreateMemoryKeyService.*` / `MemoryKeyService.*` /
  `CreateMemorySigner.*` / `MemorySigner.*` → `CreateMemoryVault.*` /
  `MemoryVault.*` / `CreateSigner.*` / `Signer.*`. See the near-api-ts v0.13.0
  changelog.

- **Breaking:** `useAccountInfo` and `useContractReadFunction` take the transport
  policy as `options.transportPolicy` instead of `policies.transport`:  \
  Previously:
  ```ts
  useAccountInfo({
    accountId: 'alice.testnet',
    policies: { transport: { rpcTypePreferences: ['Archival'] } },
  });
  ```

  Now:
  ```ts
  useAccountInfo({
    accountId: 'alice.testnet',
    options: { transportPolicy: { rpcTypePreferences: ['Archival'] } },
  });
  ```

  The same move applies to the client methods re-exported from near-api-ts
  (`getAccountInfo`, `getAccessKey`, `getAccessKeys`, `callContractReadFunction`,
  `getBlock`). See the near-api-ts v0.13.0 changelog.

- **Breaking:** the account info returned by `useAccountInfo` reports storage
  usage as `storage.usedBytes` instead of `usedStorageBytes` – the same change
  as in near-api-ts `getAccountInfo`. See the near-api-ts v0.13.0 changelog.

- The near-api-ts v0.13.0 fixes – for `getRecentBlockHash` and `getAccountInfo`
  failing right after a node starts, for a signal aborted before a call, and the
  signer's – and its `@near-js/jsonrpc-types` bump to `^1.9.0` reach this package
  through the re-export.

- **Breaking:** the peer dependencies are `react` / `react-dom` `>=19.3.1 <20`
  (was `>=19.2.8 <20`), `@tanstack/react-query` `>=5.107.1 <6` (was
  `>=5.101.4 <6`) and `zod` `>=4.6.7 <5` (was `>=4.4.3 <5`).

- `zustand` goes from `5.0.14` to `5.1.0`.

### Removed

- `createMemorySignerFactory` / `createSafeMemorySignerFactory` and their types
  `MemorySignerFactory` / `SafeMemorySignerFactory`, re-exported from
  near-api-ts – call `createSigner` once per account instead. See the
  near-api-ts v0.13.0 changelog.

---

## v0.5.0

### Added

- Everything near-api-ts v0.12.0 adds is re-exported from this package as well –
  the meta-transaction helpers (`signDelegation` / `safeSignDelegation`,
  `executeDelegation` / `safeExecuteDelegation`), the global-contract action
  creators (`registerPinnableGlobalContract`, `registerLinkableGlobalContract`,
  `pinGlobalContract`, `linkGlobalContract`, each with its `safe*` variant),
  their types and their new error kinds. See the near-api-ts changelog for the
  full list.

  The four global-contract actions reach wallets too: `useExecuteTransaction`
  and `useSignDelegation` translate them into near-connect's
  `DeployGlobalContract` / `UseGlobalContract` actions. Whether a given wallet
  can sign them is up to that wallet - near-connect exposes no feature flag for
  it.

  `ExecuteDelegationAction` is the exception: near-connect has no wire format
  for it, so an intent that carries one fails with `Error: near-connect does not
  support the ExecuteDelegation action` instead of being handed to the wallet.
  It is reachable only through a custom, non-wallet signer service.

### Changed

- **Breaking:** the `safe*` APIs re-exported from near-api-ts and signer-service
  methods `safeExecuteTransaction`, `safeSignMessage` and `safeSignDelegation`
  use the new `Result` wrapper.

  Previously:
  ```ts
  type Result<V, E> =
    | { ok: true; value: V }
    | { ok: false; error: E };
  ```

  Now:
  ```ts
  type Result<D, E> =
    | { success: true; data: D; error?: never }
    | { success: false; error: E; data?: never };
  ```

  Replace `ok` with `success` and `value` with `data` when calling or
  implementing these methods. The React hooks keep their TanStack Query
  `isSuccess`, `data` and `error` fields; mutation `onSuccess` callbacks and
  `*Async` methods still receive the unwrapped payload. No additional `Result`
  wrapper is exposed by the hooks.

- Migrated to near-api-ts v0.12.0. The package re-exports the whole near-api-ts
  surface, so its renames and removals apply to imports from `react-near-ts`
  too – most notably `Action` → `TransactionAction`, `base64ToObject` →
  `convertBase64ToObject`, `objectToU8` → `convertObjectToU8`, and the
  conversion / execution error-kind renames.

  Three of them are more than a rename:

  - `Delegation` → `DelegationBase` also renames `senderAccountId` →
    `delegatorAccountId` and `senderPublicKey` → `delegatorPublicKey`, drops
    `blockHash`, and no longer carries the actions itself – intersect it with
    `SingleDelegableAction` / `MultiDelegableActions` to get the old shape.
  - `deployContract` renames its wasm argument `wasmBytes` → `wasmU8`, and so
    does the `DeployContractAction` it returns.
  - `u8ToObject` is removed with no successor – decode the bytes yourself with
    `JSON.parse(new TextDecoder().decode(u8))`, or use `convertBase64ToObject`
    when you have a base64 string.

- `useSignDelegation` – the `intent` argument follows the reworked
  `DelegationIntent`:  \
  Previously:
  ```ts
  {
    receiverAccountId,
    expiration: { blockHeight } | { blockOffset },
    action | actions,
  }
  ```

  Now:
  ```ts
  {
    receiverAccountId,
    expiration: { blockHeight },
    delegatedAction | delegatedActions,
  }
  ```

- `useExecuteTransaction` – `intent.action` / `intent.actions` are typed as
  `TransactionAction`, which now also covers `ExecuteDelegationAction`,
  `RegisterPinnableGlobalContractAction`,
  `RegisterLinkableGlobalContractAction`, `PinGlobalContractAction` and
  `LinkGlobalContractAction`. `useSignDelegation` gains the same four
  global-contract actions through `DelegableAction`. Code that switches
  exhaustively over the actions of an intent has new branches to handle.

- `useAccountInfo` – the contract fields of `data` collapsed into a single
  discriminated union, the exported `AccountContract`, following
  `GetAccountInfoOutput`:  \
  Previously:
  ```ts
  data.contractWasmHash        // CryptoHash | null
  data.globalContractWasmHash  // CryptoHash | null
  data.globalContractAccountId // AccountId | null
  ```

  Now:
  ```ts
  data.contract
  //  | { status: 'NoContract' }
  //  | { status: 'Deployed'; localContractWasmHash: ContractWasmHash }
  //  | { status: 'Pinned'; globalContractWasmHash: ContractWasmHash }
  //  | { status: 'Linked'; globalContractAccountId: AccountId }
  ```

  This also fixes the inverted check behind the old `contractWasmHash`: an
  account with a deployed contract returned `null`, and an account without one
  returned the placeholder hash.

---

## v0.4.0

### Changed

- Migrated to near-api-ts v0.11.0
- Bump dependencies

---

## v0.3.0

### Changed

- Migrated to near-api-ts v0.10.0
- Bump dependencies
