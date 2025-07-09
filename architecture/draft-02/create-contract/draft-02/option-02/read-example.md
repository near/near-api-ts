### Read function example

#### No ABI

```ts
const client = createClient({ network: mainnet });

await client.readFunctionCall({
  contractAccountId: 'ft.near',
  fnName: 'get_ft_balance',
  jsonArgs: { account_id: 'alice.near' },
  finality: 'optimistic', // optional, default: near-final
});
```

#### With ABI

```ts
import { contractInterface as ftContractInterface } from './contractInterface.ts';

const client = createClient({ network: mainnet });

const { fnName, jsonArgs } = ftContractInterface.getFtBalance({
  accountId: 'alice.near',
});

await client.readFunctionCall({
  contractAccountId: 'ft.near',
  fnName,
  jsonArgs,
  finality: 'optimistic', // optional, default: near-final
});

await client.readFunctionCall({
  contractAccountId: 'ft.near',
  ...ftContractInterface.getFtBalance({
    accountId: 'alice.near',
  }),
  finality: 'optimistic',
});


```
