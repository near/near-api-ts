### Single signer - sequentially handle multiple actions

#### High level API

Setup
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
  ],
});

// You can specify which AccessKey you would like to use for signing
const signer = await signService.createSigner({
  signerId: 'system.near',
  signerPublicKey: 'ed25519:2igDuGDHPjNVYh6NoREwMYJy3tSF6bfQpvHD56cDimVv',
  client,
});
```

Create, sign and send Transactions

```ts
await signer.submitTransactions({
  intentions: [
    { action: transfer({ amount: { near: '1.25' } }), receiverId: 'olly.near' },
    {
      actions: [
        functionCall({
          name: 'storage_deposit',
          gasLimit: { teraGas: '10' },
          attachedDeposit: { near: '0.00125' },
        }),
        functionCall({
          name: 'ft_transfer',
          gasLimit: { teraGas: '20' },
          attachedDeposit: { yoctoNear: 1n },
        }),
      ],
      receiverId: 'olly-contract.near',
    },
  ],
});
```

Create and sign Transactions

```ts
const signedTransactions = await signer.signTransactions({
  intentions: ['same as in submitTransactions'],
});
```

Create and sign Delegate Actions

```ts
const signedDelegateActions = await signer.signDelegateActions({
  delegateIntentions: [
    {
      action: transfer({ amount: { near: '2.5' } }),
      receiverId: 'alice.near',
      validForBlocks: 1000,
    },
    {
      actions: [
        functionCall({
          name: 'storage_deposit',
          gasLimit: { teraGas: '10' },
          attachedDeposit: { near: '0.00125' },
        }),
        functionCall({
          name: 'ft_transfer',
          gasLimit: { teraGas: '20' },
          attachedDeposit: { yoctoNear: 1n },
        }),
      ],
      receiverId: 'olly-contract.near',
      maxBlockHeight: 100000000000,
    },
  ],
});
```

Sign NEP 413 Messages

```ts
const signedMessages = await signer.signMessages({
  rawMessages: [
    {
      message: 'Login with NEAR',
      nonce: '123456',
      recipient: 'bob.near',
    },
    {
      message: 'Auth',
      nonce: '654321',
      recipient: 'bob.near',
    },
  ],
});
```
