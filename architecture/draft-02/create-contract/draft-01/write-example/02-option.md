##### API Design Option 2

```ts
const ftContract = createContract({
  contractId: 'ft-token.near',
  abi,
});

// Transaction with single function call
const ftTransferAction = ftContract.ftTransfer({
  args: {
    reseiverId: 'bob.near',
    amount: '1000000000000',
  },
  gasLimit: { teraGas: '50' },
  attachedDeposit: { yoctoNear: 1n },
});

await signer.submitTransaction({
  transactionIntent: {
    action: ftTransferAction,
    receiverId: ftContract.contractId,
  },
});





//  Transaction with multi function calls
const storageDepositAction = ftContract.storageDeposit({
  args: { accountId: 'bob.near' },
  gasLimit: { teraGas: '10' },
  attachedDeposit: { near: '0.00125' },
});

await signer.submitTransaction({
  transactionIntent: {
    actions: [storageDepositAction, ftTransferAction],
    receiverAccountId: ftContract.contractId,
  },
});





// Create new FT contract
const newFtContract = createContract({
  contractId: 'new-ft-token.near',
  abi,
});

await signer.submitTransaction({
  transactionIntent: {
    actions: [
      createAccount(),
      transfer({ amount: { near: '5' } }),
      addKey({
        publicKey: 'ed25519:2igDuGDHPjNVYh6NoREwMYJy3tSF6bfQpvHD56cDimVv',
        permission: 'FullAccess',
      }),
      deployContract({ base64Wasm: '...' }),
      newFtContract.new({
        args: { name: 'New Token' },
        gasLimit: { teraGas: '50' },
      }),
      storageDepositAction,
      ftTransferAction,
    ],
    receiverId: ftContract.contractId,
  },
  waitUntil: 'NONE',
});
```
