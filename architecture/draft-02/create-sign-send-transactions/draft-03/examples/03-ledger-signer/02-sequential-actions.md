# Single signer - sequentially handle multiple actions

## High level API

```ts
const client = createClient({ network: mainnet });

const signService = await createLedgerSignService({
  keySources: [
    {
      publicKey: 'ed25519:DzWozj4DXAq2AGSbG9L7KKpkct27iz61HytHKmah7C7M',
      derivationPath: `44'/397'/0'/0'/1'`,
    },
    {
      publicKey: 'ed25519:7e8euthMqpNgrB87DQ9FfqW92skMuLYTz6te6VxiY7jE',
      derivationPath: `44'/397'/0'/0'/2'`,
    },
  ],
});

// You can specify which AccessKey you would like to use for signing
const signer = await signService.createSigner({
  signerId: 'system.near',
  signerPublicKey: 'ed25519:7e8euthMqpNgrB87DQ9FfqW92skMuLYTz6te6VxiY7jE',
  client,
});

// Same as in Memory Signer examples
await signer.submitTransactions();
const signedTransactions = await signer.signTransactions();
const signedDelegateActions = await signer.signDelegateActions();
const signedMessages = await signer.signMessages();
```
