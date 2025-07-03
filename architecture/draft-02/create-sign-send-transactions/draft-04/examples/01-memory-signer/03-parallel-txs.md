### Single signer - send multiple transactions in parallel

#### High level API

1\. Setup KeyService

```ts
const client = createClient({ network: mainnet });

const keyService = await createMemoryKeyService({
  keySources: [
    {
      privateKey:
        'ed25519:SLtBFvaoJinTmEKWqdkUBAL38Vffxo6uTcixhVMw2C1rALemo3oh4RToxYygKpXui9XCRtBnaPnmFefm9H6cvN8',
    },
    {
      seedPhrase: 'saddle ladder already bike unhappy hazard wagon ordinary jump jungle jazz lab',
      derivationPath: `m/44'/397'/0'`,
    },
    {
      seedPhrase: 'usage extend blade goat hip embrace bitter choose robot simple umbrella absorb',
    },
  ],
});
```

2\. Create Signer with Key Pool
(this pool with use all account keys, available in keyService)

```ts
const signer = await keyService.createSigner({
  signerAccountId: 'system.near',
  client,
});
```

3\. Submit multiple transactions in parallel

```ts
const action = transfer({ amount: { near: '1.25' } });

await Promise.all([
  signer.submitTransaction({
    intention: { action, receiverAccountId: 'a.near' },
  }),
  signer.submitTransaction({
    intention: { action, receiverAccountId: 'b.near' },
  }),
  signer.submitTransaction({
    intention: { action, receiverAccountId: 'c.near' },
  }),
  signer.submitTransaction({
    intention: { action, receiverAccountId: 'd.near' },
  }),
  signer.submitTransaction({
    intention: {
      actions: [
        action,
        functionCall({
          name: 'init',
          gasLimit: { teraGas: '50' },
          attachedDeposit: { near: '5' },
        }),
      ],
      receiverAccountId: 'x-contract.near',
    },
  }),
]);
```
