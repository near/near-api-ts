# Changelog

## [UNRELEASED] v0.5.0

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
