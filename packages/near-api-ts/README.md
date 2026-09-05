# near-api-ts

TypeScript library for interacting with NEAR Protocol from Node.js and the browser.

- **Typed end to end.** Arguments, outputs and *errors* all have types. Amounts are
  `NearToken` / `NearGas` objects instead of bare strings, so a yoctoNEAR value can never
  silently end up where NEAR was meant.
- **Every fallible function comes in two flavors.** A throwing one (`transfer`) and a `safe*` one
  that returns a `Result` instead of throwing (`safeTransfer`). Pick per call site.
- **Errors are data.** Every failure is a `NatError` carrying a literal `kind` and a
  `context` shaped for that kind — narrow it with `isNatError(error, 'Some.Kind')`.
- **Plain functions, no classes.** Nothing is registered globally, `sideEffects` is off,
  so bundlers can drop what you don't import.
- **The whole protocol surface.** Meta transactions (NEP-366), global contracts, NEP-413
  off-chain messages, ML-DSA-65 post-quantum keys, multi-RPC failover with retries.

[GitHub repository](https://github.com/near/near-api-ts) · [Changelog](./CHANGELOG.md)

---

## Installation

```bash
pnpm add near-api-ts zod
```

`zod` (`>=4.4.3 <5`) is a peer dependency — it validates arguments at runtime and produces
the `zodError` inside `*.Args.InvalidSchema` errors.

**Requirements:** Node.js 25+ (the package is ESM-only), or any modern browser toolchain.

### Entry points

| Import | Resolves to |
| --- | --- |
| `near-api-ts` | the right build for your runtime, picked by the `exports` map |
| `near-api-ts/nodejs` | the Node.js build |
| `near-api-ts/browser` | the browser build |

The bare `near-api-ts` import is what you normally want. Both platform builds currently
re-export the universal surface; platform-specific key services live behind the explicit
entry points as they land.

---

## Quick start

```ts
import {
  createTestnetClient,
  createMemoryKeyService,
  createMemorySigner,
  transfer,
  near,
} from 'near-api-ts';

// 1. A client reads the chain and sends signed transactions to it.
const client = createTestnetClient();

const { balance } = await client.getAccountInfo({ accountId: 'example.testnet' });
console.log(balance.total.near); // '42.5'
console.log(balance.total.yoctoNear); // 42500000000000000000000n

// 2. A key service holds private keys and signs raw bytes with them.
const keyService = createMemoryKeyService({
  keySource: { privateKey: 'ed25519:your-private-key' },
});

// 3. A signer ties an account to a client and a key service, and takes care of
//    nonces, block hashes and key selection for you.
const signer = createMemorySigner({
  signerAccountId: 'example.testnet',
  client,
  keyService,
});

const tx = await signer.executeTransaction({
  intent: {
    receiverAccountId: 'receiver.testnet',
    action: transfer({ amount: near('1.5') }),
  },
});

console.log(tx.status); // 'ExecutionSuccess'
console.log(tx.transactionHash);
```

---

## Core concepts

### Client, key service, signer

| Piece | Responsibility |
| --- | --- |
| **Client** | Talks to RPC nodes: reads accounts, blocks, contracts, sends signed transactions. Knows nothing about keys. |
| **Key service** | Owns private keys and exposes `signData` / `hasKey`. Never hands raw key pairs out. |
| **Signer** | An account + a client + a key service. Builds transactions from an *intent*, picks a usable key, manages nonces and recent block hashes, signs and sends. |

They compose in one direction only, so you can stop at any layer: use the client alone for
read-only apps, use `signTransaction` with a key pair for full manual control, or use the
signer when you just want the transaction to land.

### Throwing and safe variants

Every public function has a `safe*` twin. The throwing one raises a `NatError`; the safe
one returns a `Result`:

```ts
type Result<V, E> = { ok: true; value: V } | { ok: false; error: E };
```

```ts
const block = await client.getBlock({ blockReference: { blockHeight: 1 } }); // throws

const maybeBlock = await client.safeGetBlock({ blockReference: { blockHeight: 1 } });
if (!maybeBlock.ok) {
  console.log(maybeBlock.error.kind); // 'Client.GetBlock.Rpc.Block.GarbageCollected'
  return;
}
console.log(maybeBlock.value);
```

The safe variants carry a *narrowed* error union in their type, so your editor lists
exactly the failures a given call can produce.

### Typed errors

```ts
import { isNatError } from 'near-api-ts';

try {
  await signer.executeTransaction({
    intent: {
      receiverAccountId: 'receiver.testnet',
      action: transfer({ amount: near('1000000') }),
    },
  });
} catch (error) {
  if (isNatError(error, 'MemorySigner.ExecuteTransaction.Rpc.Signer.Budget.NotEnough')) {
    // `context` is typed for this exact kind
    console.log(error.context.info.minimalMissingAmount.near);
  }
}
```

Error kinds are hierarchical strings — `Client.GetAccountInfo.Rpc.Account.NotFound`,
`Client.SendSignedTransaction.Rpc.Action.Stake.TotalBalance.NotEnough`,
`CreateAction.FunctionCall.Args.InvalidSchema` — so a prefix tells you which call failed
and the tail tells you why. Anything the library could not classify surfaces as
`*.Internal` with the original cause in `context`.

### Amounts: NearToken and NearGas

Never pass raw numbers around. Both unit types accept either human-readable or indivisible
input, expose both representations, and come with checked arithmetic:

```ts
import { near, yoctoNear, nearToken, teraGas, gas, nearGas } from 'near-api-ts';

const amount = near('1.5'); // from NEAR
const dust = yoctoNear('1'); // from yoctoNEAR
const either = nearToken({ near: '1.5' }); // from NearTokenArgs

amount.near; // '1.5'
amount.yoctoNear; // 1500000000000000000000000n
amount.add(dust).sub({ near: '0.5' }).gt({ near: '1' }); // true

const limit = teraGas('30'); // 30 TGas
gas(30_000_000_000_000n); // the same value from raw gas
nearGas({ teraGas: '30' });
```

`isNearToken` / `isNearGas` are the type guards; `safeNear`, `safeTeraGas`, `safeNearToken`
and friends are the non-throwing constructors. Anywhere the library takes an amount it
accepts either the object or its plain args form (`{ near: '1.5' }`, `{ teraGas: '30' }`).

---

## Reading the chain

All client methods are available in both flavors (`getAccountInfo` / `safeGetAccountInfo`).

| Method | Returns |
| --- | --- |
| `getAccountInfo` | balance breakdown, storage usage, contract status, observed block |
| `getAccountAccessKey` | one access key with its nonce and permissions |
| `getAccountAccessKeys` | every access key on the account |
| `callContractReadFunction` | result of a read-only contract call plus its logs |
| `getBlock` | the raw RPC block response |
| `getRecentBlockHash` | a cached recent block hash for building transactions |
| `getTransactionResult` | the full, finalized story of a transaction |
| `sendSignedTransaction` | sends a signed transaction and reports how far it got |

### Account info

```ts
const info = await client.getAccountInfo({
  accountId: 'example.testnet',
  atMomentOf: 'LatestFinalBlock', // or { blockHeight } / { blockHash } / 'GenesisBlock'…
});

info.balance.total.near;
info.balance.available.near; // total minus everything locked
info.balance.locked.validatorStake.near;
info.balance.locked.storageDeposit.near;
info.usedStorageBytes;
info.atMomentOf; // { blockHash, blockHeight }
```

`info.contract` is a discriminated union that tells you *how* the account got its code:

```ts
switch (info.contract.status) {
  case 'NoContract':
    break;
  case 'Deployed': // its own wasm, via DeployContract
    info.contract.localContractWasmHash;
    break;
  case 'Pinned': // one exact global wasm, frozen
    info.contract.globalContractWasmHash;
    break;
  case 'Linked': // follows whatever the registrar publishes
    info.contract.globalContractAccountId;
    break;
}
```

### Access keys

```ts
const { accountAccessKey, blockHash, blockHeight } = await client.getAccountAccessKey({
  accountId: 'example.testnet',
  publicKey: 'ed25519:...',
});

accountAccessKey.nonce;

if (accountAccessKey.accessType === 'FunctionCall') {
  accountAccessKey.contractAccountId;
  accountAccessKey.gasBudget; // 'Unlimited' | NearToken
  accountAccessKey.allowedFunctions; // 'AllNonPayable' | string[]
}
```

### Read-only contract calls

By default arguments are JSON-serialized and the result is JSON-parsed as `unknown`:

```ts
const { result, logs, withStateAt } = await client.callContractReadFunction({
  contractAccountId: 'guest-book.testnet',
  functionName: 'get_messages',
  functionArgs: { from_index: 0, limit: 10 },
});
```

Pass your own codecs to get a *typed* result — the return type of `deserializeResult`
becomes the type of `result`, and the parameter type of `serializeArgs` becomes the type
required for `functionArgs`:

```ts
import { convertBase64ToObject } from 'near-api-ts';

const { result } = await client.callContractReadFunction({
  contractAccountId: 'guest-book.testnet',
  functionName: 'get_messages',
  functionArgs: { from_index: 0, limit: 10 },
  options: {
    deserializeResult: ({ rawResult }) => convertBase64ToObject(rawResult) as Message[],
  },
});

result[0].text; // typed
```

`withStateAt` also works as an *input* — pass a block reference to read historical state
(an archival RPC is used automatically when needed).

---

## Sending transactions

### With a signer

The signer resolves the nonce, the recent block hash and the signing key itself, and
serializes concurrent sends per account so parallel calls don't collide on nonces.

```ts
import { functionCall, transfer, near, teraGas } from 'near-api-ts';

// one action
await signer.executeTransaction({
  intent: {
    receiverAccountId: 'guest-book.testnet',
    action: functionCall({
      functionName: 'add_message',
      functionArgs: { text: 'Hello' },
      gasLimit: teraGas('30'),
      attachedDeposit: near('0.01'),
    }),
  },
});

// several actions in one transaction, applied atomically
await signer.executeTransaction({
  intent: {
    receiverAccountId: 'receiver.testnet',
    actions: [transfer({ amount: near('1') }), transfer({ amount: near('2') })],
  },
});
```

Use `signer.signTransaction({ intent })` when you want the signed payload without sending
it. To restrict which keys a signer may use, or to bound how long a send may wait in the
per-account queue:

```ts
const signer = createMemorySigner({
  signerAccountId: 'example.testnet',
  client,
  keyService,
  keyPool: { allowedAccessKeys: ['ed25519:...'] },
  taskQueue: { timeoutMs: 30_000 },
});
```

`createMemorySignerFactory({ client, keyService })` returns
`(signerAccountId) => MemorySigner` when one key service serves many accounts.

### Actions

| Action creator | What it does |
| --- | --- |
| `createAccount()` | creates the receiver account |
| `transfer({ amount })` | sends NEAR |
| `functionCall({ functionName, functionArgs?, gasLimit, attachedDeposit? })` | calls a contract method |
| `deployContract({ wasmU8 \| wasmBase64 })` | deploys wasm to the receiver |
| `addFullAccessKey({ publicKey })` | adds a full-access key |
| `addFunctionCallKey({ publicKey, contractAccountId, gasBudget, allowedFunctions })` | adds a restricted key |
| `deleteKey({ publicKey })` | removes an access key |
| `deleteAccount({ beneficiaryAccountId })` | deletes the account, sends the remainder to the beneficiary |
| `stake({ amount, validatorPublicKey })` | submits a staking proposal |
| `executeDelegation(signedDelegation)` | relays somebody else's signed delegation |
| `registerPinnableGlobalContract({ wasmU8 \| wasmBase64 })` | publishes immutable global code |
| `registerLinkableGlobalContract({ wasmU8 \| wasmBase64 })` | publishes replaceable global code |
| `pinGlobalContract({ globalContractWasmHash })` | adopts one exact global wasm |
| `linkGlobalContract({ globalContractAccountId })` | follows a registrar's current code |

Every creator validates its arguments and has a `safe*` twin (`safeTransfer`,
`safeFunctionCall`, …) returning a `Result` — except `createAccount`, which takes no
arguments and cannot fail.

`functionCall` also takes `options.serializeArgs` when the contract expects something other
than JSON — Borsh, for instance:

```ts
functionCall({
  functionName: 'submit',
  functionArgs: payload,
  gasLimit: teraGas('30'),
  options: { serializeArgs: ({ functionArgs }) => borshSerialize(functionArgs) },
});
```

### Signing manually

`signTransaction` is decoupled from any particular key holder: it takes a
`signDataProvider`, which is anything exposing `safeSignData` — a `KeyPair`, a
`MemoryKeyService`, or your own hardware-wallet adapter.

```ts
import { keyPair, signTransaction, transfer, near } from 'near-api-ts';

const signerKeyPair = keyPair('ed25519:your-private-key');

const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
  accountId: 'example.testnet',
  publicKey: signerKeyPair.publicKey,
});

const signed = await signTransaction({
  signDataProvider: signerKeyPair,
  transaction: {
    signerAccountId: 'example.testnet',
    signerPublicKey: signerKeyPair.publicKey,
    nonce: accountAccessKey.nonce + 1,
    blockHash,
    receiverAccountId: 'receiver.testnet',
    action: transfer({ amount: near('1') }),
  },
});

signed.transactionHash;
signed.signedTransaction; // { transaction, signature }
signed.signedTransactionBorsh64; // ready to hand to a relayer

const tx = await client.sendSignedTransaction({ signedTransaction: signed });
```

### How far to wait

`sendSignedTransaction` accepts `minimalProcessingStage`, and the shape of what you get
back follows from it:

| Stage | Meaning |
| --- | --- |
| `ConvertedOptimistic` | included in a block and turned into a receipt; the block may still be reorged |
| `ConvertedFinal` | the including block is final, receipts are still running |
| `ExecutedOptimistic` | all non-refund receipts executed, blocks not final yet (**default**) |
| `ExecutedNearlyFinal` | the including block is final and all non-refund receipts executed |
| `CompletedFinal` | everything, refunds included, is final and irreversible |

```ts
const tx = await client.sendSignedTransaction({
  signedTransaction: signed,
  minimalProcessingStage: 'CompletedFinal',
});

tx.status; // 'ExecutionSuccess'
tx.data; // the value the transaction returned (unknown by default)
tx.processingSteps.conversionStep.transactionSummary.actionSummaries;
tx.processingSteps.executionSteps; // receipts: logs, gas, produced steps, per-step results
tx.processingSteps.refundSteps; // only present at CompletedFinal
```

A transaction the node refuses to convert, or one that fails during execution, is raised as
a typed error (`Client.SendSignedTransaction.Rpc.*`) rather than returned as data — see
[Error handling](#error-handling).

### Inspecting a past transaction

`getTransactionResult` asks for the finalized picture and returns failures as *data*, so it
is the method to use when you are reporting on a transaction rather than driving it:

```ts
const result = await client.getTransactionResult({ transactionHash });

switch (result.status) {
  case 'ExecutionSuccess':
    result.data;
    break;
  case 'ConversionFailure': // the node never converted it into a receipt
    result.error.kind;
    break;
  case 'ExecutionFailure': // it ran and failed
    result.error.kind;
    break;
}
```

It also takes optional deserializers, which type the otherwise `unknown` parts of the
output: `deserializeResultData`, `deserializeActionSummaries`, `deserializeExecutionSteps`.

---

## Meta transactions (NEP-366)

A *delegator* signs a set of actions without paying for them; a *relayer* wraps that signed
delegation into its own transaction and covers the gas.

```ts
import { signDelegation, executeDelegation, functionCall, teraGas } from 'near-api-ts';

// --- delegator side ---
const { accountAccessKey, blockHeight } = await client.getAccountAccessKey({
  accountId: 'alice.testnet',
  publicKey: aliceKeyPair.publicKey,
});

const signedDelegation = await signDelegation({
  signDataProvider: aliceKeyPair,
  delegation: {
    delegatorAccountId: 'alice.testnet',
    delegatorPublicKey: aliceKeyPair.publicKey,
    receiverAccountId: 'contract.testnet',
    nonce: accountAccessKey.nonce + 1,
    expiration: { blockHeight: blockHeight + 100 },
    delegatedAction: functionCall({
      functionName: 'add_message',
      functionArgs: { text: 'Paid by somebody else' },
      gasLimit: teraGas('30'),
    }),
  },
});

// hand `signedDelegation.signedDelegationBorsh64` to the relayer

// --- relayer side ---
await relaySigner.executeTransaction({
  intent: {
    // the transaction receiver must be the delegator, not the delegation receiver
    receiverAccountId: 'alice.testnet',
    action: executeDelegation(signedDelegation),
  },
});
```

`executeDelegation` accepts `{ signedDelegationBorsh64 }`, so the whole `signDelegation`
output can be passed straight through. Delegations expire by block height, and every
delegable action is supported except nesting another delegation. Failures come back as
their own error kinds — `Action.ExecuteDelegation.Expired`, `.Signature.Invalid`,
`.Nonce.Invalid`, `.Executor.NotAllowed`, and the `.Delegator.AccessKey.*` family.

---

## Global contracts

Publish wasm once, then let any number of accounts run it without each of them paying for
its storage. Two modes:

| Register | Adopt with | Semantics |
| --- | --- | --- |
| `registerPinnableGlobalContract` | `pinGlobalContract({ globalContractWasmHash })` | addressed by the hash of the wasm; immutable — nobody can swap the code under you |
| `registerLinkableGlobalContract` | `linkGlobalContract({ globalContractAccountId })` | addressed by the registrar's account id; picks up every re-registration |

```ts
// The registrar publishes the code — a self-addressed transaction.
const registration = await registrarSigner.executeTransaction({
  intent: {
    receiverAccountId: 'registrar.testnet',
    action: registerPinnableGlobalContract({ wasmU8 }),
  },
});

// Nearcore reports the hash of the registered wasm in the action summary.
const [summary] = registration.processingSteps.conversionStep.transactionSummary.actionSummaries;
const globalContractWasmHash =
  summary?.actionType === 'RegisterPinnableGlobalContract' ? summary.contractWasmHash : undefined;

// Any account then adopts it — again, self-addressed.
await userSigner.executeTransaction({
  intent: {
    receiverAccountId: 'user.testnet',
    action: pinGlobalContract({ globalContractWasmHash }),
  },
});
```

All three actions act on the account that signs them, so the transaction receiver is always
the signer itself. Registration is asynchronous: the code becomes usable a block or so
after the register transaction succeeds, and a pin or link sent too early fails with
`Action.PinGlobalContract.GlobalContract.NotFound` /
`Action.LinkGlobalContract.GlobalContract.NotFound`. Waiting for the registration to reach
`CompletedFinal` is enough.

---

## Keys and signing

```ts
import {
  keyPair,
  randomEd25519KeyPair,
  randomSecp256k1KeyPair,
  randomMlDsa65KeyPair,
  createMemoryKeyService,
} from 'near-api-ts';

const fromPrivateKey = keyPair('ed25519:...');
const fresh = randomEd25519KeyPair();
const postQuantum = randomMlDsa65KeyPair(); // ML-DSA-65

fresh.curve; // 'ed25519'
fresh.publicKey; // 'ed25519:...'
fresh.privateKey;
fresh.publicKeyU8; // raw bytes when you need them

const { signature, signatureU8 } = await fresh.signData({ dataU8 });
```

Three curves are supported: **ed25519**, **secp256k1** and **ML-DSA-65** (post-quantum).

A key service holds several keys and signs by public key, without ever exposing the key
pair itself:

```ts
const keyService = createMemoryKeyService({
  keySources: [{ privateKey: 'ed25519:...' }, { privateKey: 'secp256k1:...' }],
});

await keyService.hasKey({ publicKey: 'ed25519:...' }); // true
await keyService.signData({ publicKey: 'ed25519:...', dataU8 });
```

Both a `KeyPair` and a `MemoryKeyService` satisfy the `signDataProvider` contract, so either
can be handed to `signTransaction` / `signDelegation`.

---

## Off-chain messages (NEP-413)

Sign-in flows and other "prove you own this account" checks use NEP-413 messages, which are
signed by a wallet but never touch the chain.

```ts
import { createMessage, verifyMessage, verifySignature } from 'near-api-ts';

// Build a message (a random 32-byte nonce is generated unless you pass one)
const message = createMessage({ message: 'Login', recipient: 'my-app.com' });

// Verify what the wallet signed: signature validity *and* that the public key
// still belongs to the claimed account.
const isValid = await verifyMessage({ signedMessage, message, client });

// Pure cryptographic check, no network access
const isSignatureValid = verifySignature({ publicKey, message: dataU8, signature });
```

---

## Error handling

Errors are grouped by where they come from:

| Group | Examples |
| --- | --- |
| **Argument validation** | `*.Args.InvalidSchema` — `context.zodError` says exactly which field |
| **Transport** | `*.Timeout`, `*.Aborted`, `*.Exhausted`, `*.PreferredRpc.NotFound` |
| **RPC / node** | `Client.GetAccountInfo.Rpc.Account.NotFound`, `Client.GetBlock.Rpc.Block.GarbageCollected` |
| **Conversion** (the node refused the transaction) | `Signer.Budget.NotEnough`, `BlockHash.Expired`, `Signer.AccessKey.NotFound`, `Actions.TooMany`, `TransactionCost.Overflow` |
| **Execution** (it ran and failed) | `Action.FunctionCall.Execution.Failed`, `Action.CreateAccount.AlreadyExists`, `Action.Stake.TotalBalance.NotEnough`, `Executor.Budget.NotEnough` |
| **Unclassified** | `*.Internal`, with the original cause in `context` |

Conversion and execution failures keep their context: a conversion failure carries the
transaction the node turned down (`context.signedTransactionBorsh64`), an execution failure
carries the whole `context.transactionDetails`, so you can inspect every receipt that ran
before things went wrong.

```ts
const sent = await client.safeSendSignedTransaction({ signedTransaction: signed });

if (!sent.ok) {
  switch (sent.error.kind) {
    case 'Client.SendSignedTransaction.Rpc.Signer.Budget.NotEnough':
      sent.error.context.info.minimalMissingAmount.near;
      break;
    case 'Client.SendSignedTransaction.Rpc.BlockHash.Expired':
      // re-sign with a fresh block hash and retry
      break;
  }
}
```

---

## Custom RPC and transport policy

`createTestnetClient()` and `createMainnetClient()` are presets. For your own endpoints:

```ts
import { createClient } from 'near-api-ts';

const client = createClient({
  transport: {
    rpcEndpoints: {
      regular: [
        { url: 'https://free.rpc.fastnear.com' },
        { url: 'https://rpc.example.com', headers: { 'x-api-key': '…' } },
      ],
      archival: [{ url: 'https://archival-rpc.mainnet.fastnear.com' }],
    },
  },
});
```

Requests retry, then fail over to the next endpoint, then start another round. The defaults:

```ts
{
  rpcTypePreferences: ['Regular', 'Archival'],
  timeouts: { requestMs: 30_000, attemptMs: 5_000 },
  rpc: { maxAttempts: 2, retryBackoff: { minDelayMs: 100, maxDelayMs: 500, multiplier: 3 } },
  failover: { maxRounds: 2, nextRpcDelayMs: 200, nextRoundDelayMs: 200 },
}
```

Override them per client (`transport.policy`) or per call (`policies.transport`), and pass
an `AbortSignal` through `options.signal` when you need to cancel:

```ts
const info = await client.getAccountInfo({
  accountId: 'example.testnet',
  policies: { transport: { timeouts: { requestMs: 5_000 } } },
  options: { signal: controller.signal },
});
```

Requests that need historical state fall back to the archival endpoints on their own.

---

## Utilities

| Export | Purpose |
| --- | --- |
| `convertObjectToU8` / `convertBase64ToObject` | JSON ⇄ bytes for contract arguments and results |
| `constants` | `NearDecimals`, `TeraGasDecimals`, `Nep413Message`, `Nep366MetaTransaction`, `BinaryLengths` |
| `toEd25519CurveString`, `toSecp256k1CurveString`, `toMlDsa65CurveString` | curve-prefixed key strings |
| `AccountIdZodSchema`, `PublicKeyZodSchema`, `MessageZodSchema`, `Base64StringZodSchema` | reuse the library's validation in your own schemas |

Types for everything above are exported too — `Client`, `MemorySigner`, `MemoryKeyService`,
`NearToken`, `NearGas`, `TransactionAction`, `TransactionIntent`, `SignedTransaction`,
`SignTransactionOutput`, `DelegationBase`, `SignDelegationOutput`, `AccountAccessKey`,
`AccountContract`, `GetAccountInfoOutput`, and the rest.

---

## License

MIT
