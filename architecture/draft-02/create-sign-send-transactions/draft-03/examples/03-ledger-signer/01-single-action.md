### Single signer - handle single action

#### High level API

```ts
const client = createClient({ network: mainnet });

// if you dont know the publicKey - see low level example
const signService = await createLedgerSignService({
  keySource: {
    publicKey: 'ed25519:DzWozj4DXAq2AGSbG9L7KKpkct27iz61HytHKmah7C7M',
    derivationPath: `44'/397'/0'/0'/1'`,
  },
});

const signer = await signService.createSigner({
  signerId: 'system.near',
  client,
});

// Same as in Memory Signer examples
await signer.submitTransactions();
const { signedTransaction } = await signer.signTransaction();
const { signedDelegateAction } = await signer.signDelegateAction();
const { signedMessage } = await signer.signMessage();
```

---

#### Low level API

```ts
const client = createClient({ network: mainnet });

const signService = await createLedgerSignService();

// Get public key from Ledger and set it in the signService.
const signerPublicKey = await signService.setupKey({
  derivationPath: `44'/397'/0'/0'/1'`,
});

const signerId = 'system.near';

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
