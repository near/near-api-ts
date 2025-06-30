### Single signer - send multiple transactions in parallel

#### High level API

1\. Setup SignService.

```ts
const client = createClient({ network: mainnet });

const signService = await createMemorySignService({
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

2.1 Either create Signer with unlimited Key Pool
(this pool with use all account keys, available in SignService)

```ts
const signer = await signService.createSigner({
  signerId: 'system.near',
  keyPool: {
    enabled: true,
  },
  client,
});
```

2.2 Or create Signer with limited Key Pool
(this pool with use only specific account keys)

```ts
const signer = await signService.createSigner({
  signerId: 'system.near',
  keyPool: {
    enabled: true,
    keys: [
      'ed25519:2igDuGDHPjNVYh6NoREwMYJy3tSF6bfQpvHD56cDimVv',
      'ed25519:DD6gcceytCD2iUUYWrLDKGGB4CPUC2eCHMXuZpTBbzBz',
    ],
  },
  client,
});
```

3\. Submit multiple transactions in parallel

Note: When you enable `keyPool` feature, signer will NOT automatically consider `intentions`
as independent transactions, which may be sent and executed in a random order.
So if you want to send them in parallel you also need to add a specific field to
`submitTransactions` and mark them as parallel-ready.

```ts
const action = transfer({ amount: { near: '1.25' } });

await signer.submitTransactions({
  inParallel: true,
  intentions: [
    { action, receiverId: 'a.near' },
    { action, receiverId: 'b.near' },
    { action, receiverId: 'c.near' },
    { action, receiverId: 'd.near' },
    {
      actions: [
        action,
        functionCall({
          name: 'init',
          gasLimit: { teraGas: '50' },
          attachedDeposit: { near: '5' },
        }),
      ],
      receiverId: 'x-contract.near',
    },
  ],
});
```
