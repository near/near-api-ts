### Read function example

#### No ABI

```ts
const client = createClient({ network: mainnet });

await client.readFunctionCall({
  contractAccountId: 'ft.near',
  fnName: 'get_ft_balance',
  fnArgsJson: { account_id: 'alice.near' },
  options: {
    finality: 'OPTIMISTIC', // or config.optimistic, optional, default: NEAR_FINAL
    // we need this field as there is no other way to transform the responce inside the client
    // responseTransformer: () => {} // Need better name - maybe fn...
  },
});
```

TODO: Add additionalFields: false for types

#### With ABI

```ts
import { contractInterface as ftContractInterface } from './contractInterface.ts';

const client = createClient({ network: mainnet });

const request = ftContractInterface.readFns.getFtBalance({
  contractAccountId: 'ft.near',
  fnArgs: { accountId: 'alice.near' },
  options: {
    finality: 'OPTIMISTIC', // optional, default: near-final
  },
});

await client.readFunctionCall(request);
```
