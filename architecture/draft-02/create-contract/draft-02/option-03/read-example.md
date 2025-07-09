### Read function example

#### No ABI

```ts
const client = createClient({ network: mainnet });

await client.readFunctionCall({
  contractAccountId: 'ft.near',
  fnName: 'get_ft_balance',
  jsonArgs: { account_id: 'alice.near' },
  finality: 'optimistic', // optional, default: near-final
  // we need this field as there is no other way to transform the responce inside the client
  // responceTransformer: () => {}
});
```

#### With ABI

```ts
import { contractInterface as ftContractInterface } from './contractInterface.ts';

const client = createClient({ network: mainnet });

// Option 1 - the best - we don't use spread operator and keep all related args in the same place
const request = ftContractInterface.getFtBalance({
  contractAccountId: 'ft.near',
  args: {
    accountId: 'alice.near',
  },
  finality: 'optimistic', // optional, default: near-final
});

await client.readFunctionCall(request);

// Option 2 - I don't like it
const params = ftContractInterface.getFtBalance({
  accountId: 'alice.near',
});

await client.readFunctionCall({
  ...params,
  contractAccountId: 'ft.near',
  finality: 'optimistic', // optional, default: near-final
});
```
