### Single signer - handle single action

#### High level API

Setup

```ts
const client = createClient({ network: mainnet });

const signService = await createFileSignService({
  filePath: './path-to-file.json'
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

