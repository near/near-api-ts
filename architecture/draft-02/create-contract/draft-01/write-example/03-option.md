##### API Design Option 3

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
  waitUntil: 'NONE', // default EXECUTED_OPTIMISTIC
});





// Transaction with multi function calls
const storageDepositIntent = ftContract.storageDeposit({
  args: { accountId: 'bob.near' },
  gasLimit: { teraGas: '10' },
  attachedDeposit: { near: '0.00125' },
});

await signer.submitTransaction({
  transactionIntent: ftContract.createIntent([storageDepositIntent, ftTransferIntent]),
  waitUntil: 'NONE',
});





// Create new FT contract
const newFtContract = createContract({
  contractId: 'new-ft-token.near',
  abi,
});

await signer.submitTransaction({
  transactionIntent: newFtContract.createIntent([
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
    storageDepositIntent,
    ftTransferIntent,
  ]),
  waitUntil: 'NONE',
});
```
