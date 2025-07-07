### Read function example

#### No ABI

```ts
const client = createClient({ network: mainnet });


await client.callContractReadFunction({
  contractId: 'ft.near',
  name: 'get_ft_balance',
  jsonArgs: { account_id: 'alice.near' },
  finality: 'optimistic', // optional, default: near-final
});
```

#### With ABI

```ts
const ftContract = createContract({
  contractId: 'ft.near',
  abi,
  client,
});

// Option 1 
await ftContract.getFtBalance({
  args: { accountId: 'alice.near' },
  finality: 'optimistic', // optional, default: near-final
});

// Option 2 - add extra path 'read' for better separation - generally dont like it
// ftContract.write.ftTransfer just return an intent/action and don't call the 
// function itself

// Also, read-functions like getFtBalance returns Promise and write-function 
// returns an object - no reason for this extra separation
await ftContract.read.getFtBalance({
  args: { accountId: 'alice.near' },
  finality: 'optimistic', // optional, default: near-final
});
```
