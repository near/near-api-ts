### Write function example

1\. Setup client and signer

```ts
const client = createClient({ network: mainnet });

const keyService = await createMemoryKeyService({
  keySource: {
    seedPhrase: 'saddle ladder already bike unhappy hazard wagon ordinary jump jungle jazz lab',
    derivationPath: `m/44'/397'/0'/1'`,
  },
});

const signer = await keyService.createSigner({
  signerAccountId: 'system.near',
  client,
});
```

---

#### No ABI

2\.1 Create a functionCallAction manually.

- Create own types for arguments and response.
- Use or not own convertor and validator between snake_case and camelCase.
- Parse response manually
- For situations when Contract ABI is not present.

```ts
const action = functionCall({
  name: 'ft_transfer',
  jsonArgs: {
    account_id: 'bob.near',
    amount: '1000000000000',
  },
  gasLimit: { teraGas: '20' },
  attachedDeposit: { yoctoNear: 1n },
});

await signer.submitTransaction({
  transactionIntent: {
    action,
    receiverAccountId: 'ft-token.near',
  },
});
```

---

#### With ABI

2\.2 Create a functionCallAction from ABI.

- Special util fetch ABI, parse it and generate types, converters and validators during dev time.
- It's automatically convert args/response between snake_case and camelCase.
- For situations when Contract ABI is present.

```ts
import { contractInterface as ftContractInterface } from './contractInterface.ts';

// Transaction with single function call
const ftTransferAction = ftContractInterface.ftTransfer({
  args: {
    reseiverAccountId: 'bob.near',
    amount: '1000000000000',
  },
  gasLimit: { teraGas: '50' },
  attachedDeposit: { yoctoNear: 1n },
});

await signer.submitTransaction({
  transactionIntent: {
    action: ftTransferAction,
    receiverAccountId: 'ft-token.near',
  },
  waitUntil: 'NONE',
});

// Delegate Action
const { signedDelegateAction } = await signer.signDelegateAction({
  delegateIntent: {
    action: ftTransferAction,
    receiverAccountId: 'ft-token.near',
  },
  validForBlocks: 600,
});


// Transaction with multi function calls
const storageDepositAction = ftContractInterface.storageDeposit({
  args: { accountId: 'bob.near' },
  gasLimit: { teraGas: '10' },
  attachedDeposit: { near: '0.00125' },
});

await signer.submitTransaction({
  transactionIntent: {
    actions: [storageDepositAction, ftTransferAction],
    receiverAccountId: 'ft-token.near',
  },
});

// Create new FT contract
const newFtContract = createContract({
  contractAccountId: 'new-ft-token.near',
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
    receiverAccountId: 'ft-token.near',
  },
  waitUntil: 'NONE',
});
```
