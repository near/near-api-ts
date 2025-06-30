### Single signer - send multiple transactions in parallel

#### High level API

```ts
const client = createClient({ network: mainnet });

const signService = await createFileSignService({
  filePath: './path-to-file.json',
});

const signer = await signService.createSigner({
  signerId: 'system.near',
  keyPool: {
    enabled: true,
  },
  client,
});

// In case you want to add more keys to the signer account and send transactions faster
// Option #1 - automatically generate private keys 
const keys = await signer.extendPool({
  keysAmount: 10,
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

await signer.submitTransactions({
  inParallel: true,
  intentions: [],
});
```
