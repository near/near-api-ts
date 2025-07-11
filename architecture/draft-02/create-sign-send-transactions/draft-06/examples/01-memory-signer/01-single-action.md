### Single signer - handle single action

#### High level API

Setup

```ts
const client = createClient({ network: mainnet });

const keyService = await createMemoryKeyService({
  keySource: {
    seedPhrase: 'saddle ladder already bike unhappy hazard wagon ordinary jump jungle jazz lab',
    derivationPath: `m/44'/397'/0'/1'`,
  },
});

const signer = await keyService.createSigner({
  signerAccountId: 'system.near',
  client,
});
```

Create, sign and send Transaction

```ts
const { result, signedTransaction, transactionHash } = await signer.executeTransaction({
  action: transfer({ amount: { near: '2.5' } }),
  receiverAccountId: 'alice.near',
  options: {
    waitUntil: 'NONE',
  },
});
```

Create and sign Transaction

```ts
const { signedTransaction } = await signer.signTransaction({
  action: transfer({ amount: { near: '2.5' } }),
  receiverAccountId: 'alice.near',
});
```

Create and sign Delegate Action

```ts
const { signedDelegateAction } = await signer.signDelegateAction({
  action: transfer({ amount: { near: '2.5' } }), // DA can't be inside DA - diff types
  receiverAccountId: 'alice.near',
  validForBlocks: 600,
});
```

Sign NEP 413 Message

```ts
const { signedMessage } = await signer.signMessage({
  message: 'Login with NEAR',
  nonce: '123456',
  recipient: 'bob.near',
});
```

---

#### Low level API

Create, sign and send Transaction

```ts
const client = createClient({ network: mainnet });

const keyService = await createMemoryKeyService({
  keySource: {
    seedPhrase: 'saddle ladder already bike unhappy hazard wagon ordinary jump jungle jazz lab',
    derivationPath: `m/44'/397'/0'/1'`,
  },
});

const signerAccountId = 'system.near';
const signerPublicKey = 'ed25519:DzWozj4DXAq2AGSbG9L7KKpkct27iz61HytHKmah7C7M';

const { nonce, blockHash } = await client.getAccessKey({
  accountId: signerAccountId,
  publicKey: signerPublicKey,
});

const { signedTransaction } = await keyService.signTransaction({
  signerAccountId,
  signerPublicKey,
  action: transfer({ amount: { near: '2.5' } }),
  receiverAccountId: 'alice.near',
  nonce: nonce + 1,
  blockHash,
});

await client.broadcastTransaction({ signedTransaction });
```
