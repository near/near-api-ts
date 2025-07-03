### Single signer - handle single action

#### High level API

Setup

```ts
const client = createClient({ network: mainnet });

const keyService = await createFileKeyService({
  filePath: './path-to-file.json'
});

const signer = await keyService.createSigner({
  signerAccountId: 'system.near',
  client,
});

// In case you want to add more keys to the signer account and send transactions faster
// Option #1 - automatically generate private keys
const keys = await signer.extendPool({
  generateKeys: 10,
});

// Option #2 - add your own keys
await signer.extendPool({
  keySources: [
    {
      privateKey:
        'ed25519:SLtBFvaoJinTmEKWqdkUBAL38Vffxo6uTcixhVMw2C1rALemo3oh4RToxYygKpXui9XCRtBnaPnmFefm9H6cvN8',
    },
    {
      seedPhrase: 'saddle ladder already bike unhappy hazard wagon ordinary jump jungle jazz lab',
      derivationPath: `m/44'/397'/0'`,
    },
  ],
});

// Same as in Memory Signer examples
await signer.submitTransactions();
const { signedTransaction } = await signer.signTransaction();
const { signedDelegateAction } = await signer.signDelegateAction();
const { signedMessage } = await signer.signMessage();
```

