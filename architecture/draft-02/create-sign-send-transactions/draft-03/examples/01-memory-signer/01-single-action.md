### Single signer - handle single action

#### High level API

Setup

```ts
const client = createClient({ network: mainnet });

const signService = await createMemorySignService({
  keySource: {
    seedPhrase: 'saddle ladder already bike unhappy hazard wagon ordinary jump jungle jazz lab',
    derivationPath: `m/44'/397'/0'/1'`,
  },
});

const signer = await signService.createSigner({
  signerId: 'system.near',
  client,
});
```

Create, Sign and Send TX

```ts
await signer.submitTransaction({
  intention: {
    action: transfer({ amount: { near: '2.5' } }),
    receiverId: 'alice.near',
  },
});
```

Create and Sign TX

```ts
const { signedTransaction } = await signer.signTransaction({
  intention: {
    action: transfer({ amount: { near: '2.5' } }),
    receiverId: 'alice.near',
  },
});
```

Create and Sign DA

```ts
const { signedDelegateAction } = await signer.signDelegateAction({
  delegateIntention: {
    action: transfer({ amount: { near: '2.5' } }),
    receiverId: 'alice.near',
    validForBlocks: 600,
  },
});
```

Sign NEP 413 Message

```ts
const { signedMessage } = await signer.signMessage({
  rawMessage: {
    message: 'Login with NEAR',
    nonce: '123456',
    recipient: 'bob.near',
  },
});
```

---

#### Low level API

```ts
const client = createClient({ network: mainnet });

const signService = await createMemorySignService({
  keySource: {
    seedPhrase: 'saddle ladder already bike unhappy hazard wagon ordinary jump jungle jazz lab',
    derivationPath: `m/44'/397'/0'/1'`,
  },
});

const signerId = 'system.near';
const signerPublicKey = 'ed25519:DzWozj4DXAq2AGSbG9L7KKpkct27iz61HytHKmah7C7M';

const { nonce, blockHash } = await client.getAccessKey({
  accountId: signerId,
  publicKey: signerPublicKey,
});

const { signedTransaction } = await signService.signTransaction({
  transaction: {
    signerId,
    signerPublicKey,
    action: transfer({ amount: { near: '2.5' } }),
    receiverId: 'alice.near',
    nonce: nonce + 1,
    blockHash,
  },
});

await client.sendTransaction({ signedTransaction });
```
