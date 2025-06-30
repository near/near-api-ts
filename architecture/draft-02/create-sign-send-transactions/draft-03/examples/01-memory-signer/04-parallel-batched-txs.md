### Single signer - send multiple transaction batches in parallel

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
    {
      seedPhrase:
        'govern nephew ahead season oppose electric axis comfort goose genre purity scatter',
    },
    {
      seedPhrase: 'ribbon avoid vessel pool average depart foil dizzy purse rose repair gossip',
    },
  ],
});
```

2 Create Signer with unlimited Key Pool
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

3\. Submit multiple transaction batches in parallel

Let's imagine the case:
We have 2 transaction batches (`B1`, `B2`), each of them contains 3 transactions. These transactions
must be sent sequentially, but batches is not dependent on each other
and can be sent in parallel.

Also, we have 2 transactions (`X`, `Y`), which are independent, and can be sent
in parallel.

We have a KeyPool with 5 keys, which allows us to send 5 transactions in the same time.
When we will run the code below, the send order will be the next:
`A, D, X, Y`. `B` will send after `A`, and `E` will send after `D`, no matter
we have a 1 unused key at this moment.

```ts
const action = transfer({ amount: { near: '1.25' } });

await Promise.all([
  // Batch B1
  signer.submitTransactions({
    intentions: [
      { action, receiverId: 'a.near' }, // Transaction A
      { action, receiverId: 'b.near' }, // Transaction B
      { action, receiverId: 'c.near' }, // Transaction C
    ],
  }),
  // Batch B2
  signer.submitTransactions({
    intentions: [
      { action, receiverId: 'd.near' }, // Transaction D
      { action, receiverId: 'e.near' }, // Transaction E
      { action, receiverId: 'f.near' }, // Transaction F
    ],
  }),
  signer.submitTransactions({
    inParallel: true,
    intentions: [
      { action, receiverId: 'x.near' }, // Transaction X
      { action, receiverId: 'y.near' }, // Transaction Y
    ],
  }),
]);
```
