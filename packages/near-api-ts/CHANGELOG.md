# Changelog

## [UNRELEASED] v0.13.0

### Added

- **`PublicKeyRef`** – how an account refers to its access keys: an ed25519 or
  secp256k1 key by the public key itself, an ml-dsa-65 key by its hash,
  `'ml-dsa-65-hash:<base58>'`, since the protocol does not store the full
  1952-byte key.

  - New type `PublicKeyRef`.
  - Every key pair carries its own `publicKeyRef` – compare it with the refs an
    account lists:

    ```ts
    const { accessKeys } = await client.getAccessKeys({ accountId });
    const isAccountKey = accessKeys.some(
      (key) => key.publicKeyRef === keyPair.publicKeyRef,
    );
    ```

  - `MemoryKeyService` gains `findPublicKey({ publicKeyRef })` /
    `safeFindPublicKey`: the full public key when the service holds it,
    `undefined` otherwise. New error kinds
    `MemoryKeyService.FindPublicKey.Args.InvalidSchema` and
    `MemoryKeyService.FindPublicKey.Internal`.
  - `constants.BinaryLengths.<Curve>.PublicKeyRef` – the decoded length of a
    ref: 32 bytes for ed25519 and ml-dsa-65, 64 for secp256k1.

- **Gas keys can be added** – `addAccessKey` with `gasPayment: { source: 'KeyBalance' }`
  and `replayProtection: { channelCount }` (1..1024) adds a key that pays for gas
  from a balance of its own and signs up to that many transactions in parallel,
  with either permission. The key starts with an empty balance – the protocol
  accepts no other – and takes no `allowance`. The upper limit is
  `constants.NonceChannels.MaxChannelCount`.

- **Gas keys can be funded and drained** – two new actions move NEAR between an
  account and the balance of its key with `gasPayment.source: 'KeyBalance'`:

  ```ts
  topUpAccessKeyBalance({ publicKey, amount: near('1') }); // account → key
  withdrawAccessKeyBalance({ publicKey, amount: near('0.4') }); // key → account
  ```

  - Both take a public key and an amount, have `safe*` twins
    (`safeTopUpAccessKeyBalance`, `safeWithdrawAccessKeyBalance`) and work in a
    transaction and in a delegation alike. New types
    `TopUpAccessKeyBalanceAction` and `WithdrawAccessKeyBalanceAction`; new
    error kinds `CreateAction.{TopUpAccessKeyBalance,WithdrawAccessKeyBalance}.{Args.InvalidSchema,Internal}`.
  - Anyone can top up a key of any account; only the account itself can
    withdraw.
  - Action summaries report them as `{ actionType, publicKey, amount }`.
  - New execution error kinds, also reachable as
    `Client.SendSignedTransaction.Rpc.<kind>`:
    `Action.TopUpAccessKeyBalance.Balance.NotFound` and
    `Action.WithdrawAccessKeyBalance.Balance.NotFound` – the key has no balance
    of its own: it is missing or paid from the account balance – with
    `{ accountId, publicKey }`, and
    `Action.WithdrawAccessKeyBalance.Balance.NotEnough` with
    `{ accountId, publicKey, keyBalance, withdrawalAmount, excessAmount }`.

- **`getAccessKeyNonceChannels`** / `safeGetAccessKeyNonceChannels` – the last
  nonce of every channel of a key with `replayProtection.scheme: 'NonceChannels'`,
  which `getAccessKey` reports only as `channelCount`:

  ```ts
  const { nonceChannels, atMomentOf } = await client.getAccessKeyNonceChannels({
    accountId,
    publicKey,
  });
  nonceChannels; // [{ channelId: 0, lastNonce }, …] – channelId runs 0..channelCount - 1
  ```

  A missing account, a missing key and a key with a single nonce channel all
  fail with `Client.GetAccessKeyNonceChannels.Rpc.NonceChannels.NotFound`. The
  other error kinds match the rest of the client:
  `Client.GetAccessKeyNonceChannels.{Args.InvalidSchema, PreferredRpc.NotFound,
  Timeout, Aborted, Exhausted, Rpc.NotSynced, Rpc.Shard.NotTracked,
  Rpc.Block.GarbageCollected, Rpc.Block.NotFound, Internal}`.

- **Gas keys can sign** – a transaction or a delegation takes one nonce channel
  of a key with `replayProtection.scheme: 'NonceChannels'`, so the key signs up
  to `channelCount` of them in parallel:

  ```ts
  signer: {
    accountId,
    publicKey: gasKeyPair.publicKey,
    replayProtection: { scheme: 'NonceChannels', nonceChannelId: 0, nonce: lastNonce + 1 },
  }
  ```

  `nonceChannelId` runs `0..channelCount - 1`, the `channelId` that
  `getAccessKeyNonceChannels` reports. A transaction pays for gas from the key's
  balance; a delegation is paid for by its relayer, as any other.

- **`nonceProgression`** in a transaction's `signer.replayProtection`:
  `'Consecutive'` (the default) takes exactly `lastNonce + 1`, `'Increasing'`
  takes any nonce above `lastNonce`. A delegation has no such field – the
  protocol only checks that its nonce is above `lastNonce`.

### Changed

- **Breaking:** `Transaction` (the argument of `signTransaction`) groups who signs
  under `signer` and renames `blockHash`:  \
  Previously:
  ```ts
  {
    signerAccountId,
    signerPublicKey,
    nonce,
    blockHash,
    receiverAccountId,
    action,
  }
  ```

  Now:
  ```ts
  {
    signer: {
      accountId, // was signerAccountId
      publicKey, // was signerPublicKey
      replayProtection: { scheme: 'NonceChannel', nonce }, // was nonce
    },
    recentBlockHash, // was blockHash
    receiverAccountId,
    action,
  }
  ```

  `signedTransaction.transaction` in the output of `signTransaction` has the same
  shape, with `nonceProgression` filled in.

- **Breaking:** a transaction must use the very next nonce of its channel by
  default. Every transaction is now signed in the protocol's newer format (it
  needs a node with protocol version 85 or later), with
  `nonceProgression: 'Consecutive'` unless it says otherwise, so a nonce that
  skips ahead – `lastNonce + 2` – fails with
  `Client.SendSignedTransaction.Rpc.Nonce.Invalid` instead of being accepted.
  Pass `nonceProgression: 'Increasing'` to keep the old behaviour, e.g. for
  transactions that may reach the node out of order. The same transaction gets
  a different `transactionHash` than before. A memory signer signs this way too:
  its `executeTransaction` is unaffected, as it sends one transaction per key at
  a time, but transactions from its `signTransaction` now have to be sent in the
  order they were signed.

- **Breaking:** the delegation passed to `signDelegation` groups who signs under
  `delegator`, the way a transaction does:  \
  Previously:
  ```ts
  { delegatorAccountId, delegatorPublicKey, nonce, receiverAccountId, expiration, delegatedAction }
  ```

  Now:
  ```ts
  {
    delegator: {
      accountId, // was delegatorAccountId
      publicKey, // was delegatorPublicKey
      replayProtection: { scheme: 'NonceChannel', nonce }, // was nonce
    },
    receiverAccountId,
    expiration,
    delegatedAction,
  }
  ```

  `SignedDelegation` and `DelegationBase` change the same way.

- **Breaking:** `signDelegation` signs in the NEP-611 format, the one that can
  name a nonce channel: `signedDelegation.delegation.tag` is
  `constants.Delegation.Nep611Tag` instead of `constants.Delegation.Nep366Tag`,
  and the node relaying it needs protocol version 85 or later. A relayer on an
  older version of this library cannot read such a delegation.
  `executeDelegation` still accepts a NEP-366 delegation signed elsewhere – the
  tag of the signed delegation tells which one it got. Like the node, it now
  rejects bytes left over after the delegation with
  `CreateAction.ExecuteDelegation.SignedDelegation.Deserialize.Failed` instead of
  ignoring them.

- **Breaking:** the delegation tags live in one constant:
  `constants.Nep366MetaTransaction.Tag` → `constants.Delegation.Nep366Tag`, next
  to the new `constants.Delegation.Nep611Tag`.

- **Breaking:** the transaction summary in `processingSteps.conversionStep`
  reports the signer the way the transaction takes it:  \
  Previously:
  ```ts
  transactionSummary.signerAccountId;
  transactionSummary.signerPublicKey;
  transactionSummary.nonce;
  ```

  Now:
  ```ts
  transactionSummary.signer.accountId;
  transactionSummary.signer.publicKey;
  transactionSummary.signer.replayProtection; // { scheme, nonceChannelId?, nonce, nonceProgression }
  ```

  The `ExecuteDelegation` action summary does the same: `delegation.delegator`
  `{ accountId, publicKey, replayProtection }` replaces `delegatorAccountId`,
  `delegatorPublicKey` and `nonce`. It now covers NEP-611 delegations too –
  `getTransactionResult` for a transaction relaying one used to fail with
  `Client.GetTransactionResult.Internal`.

- **Breaking:** the access key API drops the `Account` prefix:

  - `getAccountAccessKey` / `safeGetAccountAccessKey` → `getAccessKey` /
    `safeGetAccessKey`; its output field `accountAccessKey` → `accessKey`.
  - `getAccountAccessKeys` / `safeGetAccountAccessKeys` → `getAccessKeys` /
    `safeGetAccessKeys`; its output field `accountAccessKeys` → `accessKeys`.
  - The type `AccountAccessKey` → `AccessKey`.
  - Error kinds `Client.GetAccountAccessKey.*` → `Client.GetAccessKey.*` and
    `Client.GetAccountAccessKeys.*` → `Client.GetAccessKeys.*`, including
    `Client.GetAccountAccessKey.Rpc.AccountAccessKey.NotFound` →
    `Client.GetAccessKey.Rpc.AccessKey.NotFound`. The `cause` of
    `VerifyMessage.AccessKeys.NotLoaded` and
    `MemorySigner.{SignTransaction,ExecuteTransaction}.KeyPool.AccessKeys.NotLoaded`
    carries the new kinds.
  - The context of `MemorySigner.SignTransaction.KeyPool.Empty` and
    `MemorySigner.ExecuteTransaction.KeyPool.Empty`: `accountAccessKeys` →
    `accessKeys`.
  - `verifyMessage` calls `client.safeGetAccessKeys` instead of
    `client.safeGetAccountAccessKeys`. A client from `createClient` has it; a
    hand-made `client` object has to rename the method.

- **Breaking:** `AccessKey`, returned by `getAccessKey` and `getAccessKeys`, has
  a new shape. What the key may do, who pays for its gas and which nonces it
  signs with are three separate fields now, and the key is referred to by
  `publicKeyRef` instead of `publicKey`:  \
  Previously:
  ```ts
  { accessType: 'FullAccess', publicKey: PublicKey, nonce }
  { accessType: 'FunctionCall', publicKey, nonce, contractAccountId, gasBudget, allowedFunctions }
  ```

  Now:
  ```ts
  {
    publicKeyRef: PublicKeyRef,
    permission: { kind: 'FullAccess' },
    gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
    replayProtection: { scheme: 'NonceChannel', lastNonce },
  }
  {
    publicKeyRef,
    permission: { kind: 'FunctionCall', allowedContract, allowedFunctions },
    gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' | NearToken }, // was gasBudget
    replayProtection: { scheme: 'NonceChannel', lastNonce },
  }
  ```

  The union also gains gas keys – keys that pay for gas from a balance of their
  own and keep up to 1024 independent nonce channels, with either permission:
  `gasPayment: { source: 'KeyBalance', balance }` and
  `replayProtection: { scheme: 'NonceChannels', channelCount }`. Such a key
  has no `lastNonce`, so check the scheme before reading it:

  ```ts
  const { replayProtection } = accessKey;
  if (replayProtection.scheme === 'NonceChannel')
    nonce = replayProtection.lastNonce + 1;
  ```

  The exported types `FullAccessKey` and `FunctionCallKey` are renamed to
  `AccountBalanceFullAccessKey` and `AccountBalanceFunctionCallKey`;
  `KeyBalanceFullAccessKey` and `KeyBalanceFunctionCallKey` are new.

  For ed25519 and secp256k1 keys `publicKeyRef` holds the same value
  `publicKey` did. For an ml-dsa-65 key the value is now the hash:
  `getAccountAccessKey` used to return the full key it was asked about, and
  `getAccountAccessKeys` returned the hash typed as a `PublicKey`. To check
  whether a key belongs to an account, compare against `keyPair.publicKeyRef`,
  not `keyPair.publicKey`.

  This also fixes ml-dsa-65 keys wherever the library matched an account's keys
  against local ones: `createMemorySigner` ignored them – also when they were
  named in `keyPool.allowedAccessKeys` – so an account that could sign only
  with such a key could not sign at all, and `verifyMessage` returned `false`
  for a valid ml-dsa-65 signature.

- **Breaking:** `addFullAccessKey` / `safeAddFullAccessKey` and
  `addFunctionCallKey` / `safeAddFunctionCallKey` are replaced by one creator,
  `addAccessKey` / `safeAddAccessKey`, whose arguments follow the `AccessKey`
  shape:  \
  Previously:
  ```ts
  addFullAccessKey({ publicKey });
  addFunctionCallKey({ publicKey, contractAccountId, gasBudget, allowedFunctions });
  ```

  Now:
  ```ts
  addAccessKey({
    publicKey,
    permission: { kind: 'FullAccess' },
    gasPayment: { source: 'AccountBalance' },
  });
  addAccessKey({
    publicKey,
    permission: { kind: 'FunctionCall', allowedContract, allowedFunctions }, // was contractAccountId
    gasPayment: { source: 'AccountBalance', allowance }, // was gasBudget
  });
  ```

  A field that belongs to another kind of key – an `allowance` on a full access
  key, `replayProtection` on a key paid from the account balance – is rejected
  rather than ignored.

  - The action they return, and the one a hand-written `actions` entry must
    have, is `{ actionType: 'AddAccessKey', ...args }` – `actionType: 'AddKey'`
    is renamed and `accessType` is gone. The types `AddFullAccessKeyAction` and
    `AddFunctionCallKeyAction` are replaced by `AddAccessKeyAction`.
  - The action summary in `processingSteps` (also inside an
    `ExecuteDelegation`) has the same shape – `actionType: 'AddAccessKey'` – with
    the allowance as a `NearToken`.
    It covers gas keys too: `getTransactionResult` for a transaction that adds
    one – built by another library – used to fail with
    `Client.GetTransactionResult.Internal`.
  - Error kinds `CreateAction.AddFullAccessKey.*` and
    `CreateAction.AddFunctionCallKey.*` → `CreateAction.AddAccessKey.Args.InvalidSchema`
    and `CreateAction.AddAccessKey.Internal`.
  - The node's errors about the action follow its new name:
    - `Action.AddKey.AllowedFunctions.FunctionName.TooLong` →
      `Action.AddAccessKey.AllowedFunctions.FunctionName.TooLong`
    - `Action.AddKey.AllowedFunctions.TotalSize.Exceeded` →
      `Action.AddAccessKey.AllowedFunctions.TotalSize.Exceeded`
    - `Action.AddKey.AlreadyExists` → `Action.AddAccessKey.AlreadyExists`

    The renames propagate to every kind built on top of them, e.g.
    `Client.SendSignedTransaction.Rpc.Action.AddKey.AlreadyExists` →
    `Client.SendSignedTransaction.Rpc.Action.AddAccessKey.AlreadyExists`.

- **Breaking:** a custom `keyService` passed to `createMemorySigner` or
  `createMemorySignerFactory` must implement `findPublicKey` and
  `safeFindPublicKey` – the `MemoryKeyService` type requires both, and the
  signer calls `safeFindPublicKey` to turn the refs an account lists back into
  keys it can sign with.

- **Breaking:** the per-call transport policy moved from `policies.transport` to
  `options.transportPolicy` – the shape `getTransactionResult` and
  `sendSignedTransaction` already use. Affects `getAccountInfo`,
  `getAccessKey`, `getAccessKeys`, `callContractReadFunction` and `getBlock`,
  together with their `safe*` variants:  \
  Previously:
  ```ts
  await client.getAccountInfo({
    accountId: 'alice.testnet',
    policies: { transport: { timeouts: { requestMs: 5_000 } } },
    options: { signal },
  });
  ```

  Now:
  ```ts
  await client.getAccountInfo({
    accountId: 'alice.testnet',
    options: { transportPolicy: { timeouts: { requestMs: 5_000 } }, signal },
  });
  ```

  A leftover `policies` field is no longer read. TypeScript rejects it in an
  object literal, but when it slips through (plain JS, a spread object) the call
  silently falls back to the client's transport policy.

- **Breaking:** `getAccountInfo` output (`GetAccountInfoOutput`) reports the
  storage the account occupies as `storage.usedBytes` instead of the top-level
  `usedStorageBytes`:  \
  Previously:
  ```ts
  const { usedStorageBytes } = await client.getAccountInfo({ accountId });
  ```

  Now:
  ```ts
  const { storage } = await client.getAccountInfo({ accountId });
  storage.usedBytes;
  ```

  The tokens locked to pay for that storage stay in
  `balance.locked.storageDeposit`.

- **Breaking:** `getAccessKey` and `getAccessKeys` report the block they read at
  as `atMomentOf: { blockHash, blockHeight }` – the shape `getAccountInfo`
  already uses – instead of top-level `blockHash` and `blockHeight`:  \
  Previously:
  ```ts
  const { blockHash, blockHeight } = await client.getAccessKey({ accountId, publicKey });
  ```

  Now:
  ```ts
  const { atMomentOf } = await client.getAccessKey({ accountId, publicKey });
  atMomentOf.blockHash;
  atMomentOf.blockHeight;
  ```

  Both outputs also drop `rawRpcResult`: read the keys from `accessKey` /
  `accessKeys` and the block from `atMomentOf`.

- An account holding a gas key no longer breaks the library:
  `getAccountAccessKey` failed on such a key and `getAccountAccessKeys` on such an
  account, and with them `createMemorySigner`
  (`MemorySigner.KeyPool.AccessKeys.NotLoaded`) and `verifyMessage`
  (`VerifyMessage.AccessKeys.NotLoaded`). The memory signer still signs only with
  keys paid from the account balance and leaves gas keys out of its pool, also
  when `keyPool.allowedAccessKeys` names them. `verifyMessage` accepts a message
  signed by a gas key with full access, like any other full access key.

- `getRecentBlockHash` returns the hash of the final block rather than the
  near-final one – one block older, which the transaction validity period
  absorbs. Right after a node starts (a fresh sandbox, for example) the
  near-final block does not exist yet, so `getRecentBlockHash` failed with
  `Client.GetRecentBlockHash.Internal`, a memory signer with
  `MemorySigner.SignTransaction.Internal` /
  `MemorySigner.ExecuteTransaction.Internal`, and `getAccountInfo` with
  `Client.GetAccountInfo.StoragePricePerByte.NotLoaded`.

- Bump `@near-js/jsonrpc-types` from `^1.8.0` to `^1.9.0`. The `rawRpcResult`
  type of `getBlock` comes from it.

---

## v0.12.0

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

- **Breaking:** change the `Result` returned by `safe*` APIs: `ok` becomes
  `success`, and `value` becomes `data`. `error` keeps its name.

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

  Update property access, destructuring and custom result producers, including
  `signDataProvider.safeSignData`. You can now destructure `success`, `data` and
  `error` together and narrow them by checking `success`. The old wrapper is no
  longer accepted. Payloads, errors and throwing counterparts are unaffected by
  this wrapper change.

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
