### Read function example

#### No ABI

```ts
const client = createClient({ network: mainnet });

await client.readFunctionCall({
  request: {
    contractAccountId: 'ft.near',
    fnName: 'get_ft_balance',
    jsonArgs: { account_id: 'alice.near' },
  },
  finality: 'optimistic', // optional, default: near-final
});
```

#### With ABI

```ts
const client = createClient({ network: mainnet });

const ftContractInterface = createContractInterface({
  contractAccountId: 'ft.near',
  abi,
});

await client.readFunctionCall({
  request: ftContractInterface.getFtBalance({
    accountId: 'alice.near',
  }),
  finality: 'optimistic', // optional, default: near-final
});
```
