### Single signer - handle single action

#### High level API

```ts
const client = createClient({ network: mainnet });

// if you dont know the publicKey - see low level example
const keyService = await createLedgerKeyService({
  keySource: {
    publicKey: 'ed25519:DzWozj4DXAq2AGSbG9L7KKpkct27iz61HytHKmah7C7M',
    derivationPath: `44'/397'/0'/0'/1'`,
  },
});

const signer = await keyService.createSigner({
  signerAccountId: 'system.near',
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

const keyService = await createLedgerKeyService();

// Get public key from Ledger and set it in the keyService.
const signerPublicKey = await keyService.setupKey({
  derivationPath: `44'/397'/0'/0'/1'`,
});

const signerAccountId = 'system.near';

const { nonce, blockHash } = await client.getAccessKey({
  accountId: signerAccountId,
  publicKey: signerPublicKey,
});

const { signedTransaction } = await keyService.signTransaction({
  transaction: {
    signerAccountId,
    signerPublicKey,
    action: transfer({ amount: { near: '2.5' } }),
    receiverAccountId: 'alice.near',
    nonce: nonce + 1,
    blockHash,
  },
});

await client.sendTransaction({ signedTransaction });
```
