##### API Design Option 1
Here we are trying to simplify calling transaction with single function call as much 
as possible.

```ts
const ftContract = createContract({
  contractId: 'ft-token.near',
  abi,
});

// Transaction with single function call
const ftTransferIntent = ftContract.ftTransfer({
  args: {
    reseiverId: 'bob.near',
    amount: '1000000000000',
  },
  gasLimit: { teraGas: '50' },
  attachedDeposit: { yoctoNear: 1n },
});

await signer.submitTransaction({
  transactionIntent: ftTransferIntent,
});






// Transaction with multi function calls
const storageDepositIntent = ftContract.storageDeposit({
  args: { accountId: 'bob.near' },
  gasLimit: { teraGas: '10' },
  attachedDeposit: { near: '0.00125' },
});

await signer.submitTransaction({
  transactionIntent: {
    actions: [storageDepositIntent.action, ftTransferIntent.action], // or [storageDepositIntent, ftTransferIntent],
    receiverId: ftTransferIntent.receiverId,
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
      storageDepositIntent.action,
      ftTransferIntent.action,
    ],
    receiverId: ftContract.contractId,
  },
  waitUntil: 'NONE',
});
```
