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
    receiverId: 'ft-token.near',
  },
});
```

---

#### With ABI

2\.2 Create a functionCallAction from ABI.

- Special util fetch ABI, parse it and generate types, converters and validators during dev time.
- It's automatically convert args/response between snake_case and camelCase.
- For situations when Contract ABI is present.
