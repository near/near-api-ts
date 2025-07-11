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
  fnName: 'ft_transfer',
  fnArgsJson: {
    account_id: 'bob.near',
    amount: '1000000000000',
  },
  gasLimit: { teraGas: '20' },
  attachedDeposit: { yoctoNear: 1n },
});

await signer.executeTransaction({
  action,
  receiverAccountId: 'ft-token.near',
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

const ftTransferAction = ftContractInterface.writeFns.ftTransfer({
  fnArgs: {
    reseiverAccountId: 'bob.near',
    amount: '1000000000000',
  },
  gasLimit: { teraGas: '50' },
  attachedDeposit: { yoctoNear: 1n },
});

const storageDepositAction = ftContractInterface.writeFns.storageDeposit({
  fnArgs: { accountId: 'bob.near' },
  gasLimit: { teraGas: '10' },
  attachedDeposit: { near: '0.00125' },
});

// Transaction with single function call
await signer.executeTransaction({
  action: ftTransferAction,
  receiverAccountId: 'ft-token.near',
  options: { // thing about name
    waitUntil: 'NONE',
  },
});

// Delegate Action
const { signedTransaction } = await signer.signTransaction({
  action: ftTransferAction,
  receiverAccountId: 'ft-token.near',
});

// Delegate Action
const { signedDelegateAction } = await signer.signDelegateAction({
  action: ftTransferAction,
  receiverAccountId: 'ft-token.near',
  validForBlocks: 600,
});

// Transaction with multi function calls
await signer.commitTransaction({
  actions: [storageDepositAction, ftTransferAction],
  receiverAccountId: 'ft-token.near',
});

// Create new FT contract
await signer.executeTransaction({
  actions: [
    createAccount(),
    transfer({ amount: { near: '5' } }),
    addKey({
      publicKey: 'ed25519:2igDuGDHPjNVYh6NoREwMYJy3tSF6bfQpvHD56cDimVv',
      permission: 'FullAccess',
    }),
    deployContract({ base64Wasm: '...' }),
    ftContractInterface.writeFns.new({
      fnArgs: { name: 'New Token' },
      gasLimit: { teraGas: '50' },
    }),
    storageDepositAction,
    ftTransferAction,
  ],
  receiverAccountId: 'ft-token.near',
  options: {
    waitUntil: 'NONE',
  }
});
```
