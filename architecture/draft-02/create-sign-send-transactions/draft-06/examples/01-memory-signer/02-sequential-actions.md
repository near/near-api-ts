### Single signer - sequentially handle multiple actions

#### High level API

Setup

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
  ],
});

// You can specify which AccessKey you would like to use for signing
const signer = await keyService.createSigner({
  signerAccountId: 'system.near',
  signerPublicKey: 'ed25519:2igDuGDHPjNVYh6NoREwMYJy3tSF6bfQpvHD56cDimVv',
  client,
});
```

Create, sign and send Transactions

```ts
await signer.executeMultipleTransactions({
  transactionIntents: [
    { action: transfer({ amount: { near: '1.25' } }), receiverAccountId: 'olly.near' },
    {
      actions: [
        functionCall({
          fnName: 'storage_deposit',
          gasLimit: { teraGas: '10' },
          attachedDeposit: { near: '0.00125' },
        }),
        functionCall({
          fnName: 'ft_transfer',
          fnArgsJson: {
            account_id: 'bob.near',
          },
          gasLimit: { teraGas: '20' },
          attachedDeposit: { yoctoNear: 1n },
        }),
      ],
      receiverAccountId: 'ft-token.near',
    },
  ],
  waitUntil: 'NONE', // Or inside the every transaction intent?
});
```

Create and sign Transactions

```ts
const signedTransactions = await signer.signTransactions({
  transactionIntents: [],
});
```

Create and sign Delegate Actions

```ts
const signedDelegateActions = await signer.signDelegateActions({
  delegateIntents: [
    {
      action: transfer({ amount: { near: '2.5' } }),
      receiverAccountId: 'alice.near',
      validForBlocks: 1000,
    },
    {
      actions: [
        functionCall({
          fnName: 'storage_deposit',
          gasLimit: { teraGas: '10' },
          attachedDeposit: { near: '0.00125' },
        }),
        functionCall({
          fnName: 'ft_transfer',
          fnArgsJson: {
            account_id: 'bob.near',
          },
          gasLimit: { teraGas: '20' },
          attachedDeposit: { yoctoNear: 1n },
        }),
      ],
      receiverAccountId: 'olly-contract.near',
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
