# Single signer - send multiple transactions in parallel

High level API

When you enable `createKeyPool` feature, signer will NOT automatically consider `intentions`
as independent transactions, which may be sent and executed in a random order.
So if you want to send them in parallel you also need to add a specific field to
`submitTransactions` and mark them as parallel-ready.

```ts
const client = createNearClient({ network: mainnet });

const signService = await createSignService({
  storageType: 'memory',
  keys: [
    {
      privateKey: 'ed25519:SLtBFvaoJinTmEKWqdkUBAL38Vffxo6uTcixhVMw2C1rALemo3oh4RToxYygKpXui9XCRtBnaPnmFefm9H6cvN8',
    },
    {
      seedPhrase: 'saddle ladder already bike unhappy hazard wagon ordinary jump jungle jazz lab',
    },
  ],
});

const signer = await createSigner({
  signerId: 'system.near',
  keyPool: {
    size: 3,
  },
  client,
  signService,
});

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
