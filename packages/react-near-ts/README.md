# react-near-ts

TypeScript-first React wrapper for `near-api-ts` with built-in wallet connection
via `@hot-labs/near-connect`.

#### Live demo: https://react-near-ts-next-playground.vercel.app

## Installation

```bash
pnpm add react-near-ts react react-dom @tanstack/react-query zod
```

## Quick Start

For mainnet:

```tsx
import { MainnetNearProvider } from 'react-near-ts';

export const App = () => (
  <MainnetNearProvider>
    <h1>Hello, Near!</h1>
  </MainnetNearProvider>
);
```

For testnet:

```tsx
import { TestnetNearProvider } from 'react-near-ts';

export const App = () => (
  <TestnetNearProvider>
    <h1>Hello, Near!</h1>
  </TestnetNearProvider>
);
```

### Custom setup

```tsx
import {
  NearProvider,
  createNearStore,
  createClient,
  createNearConnectorService,
} from 'react-near-ts';

const clientCreator = () => createClient({
  transport: {
    rpcEndpoints: {
      regular: [{ url: 'https://free.rpc.fastnear.com' }],
      archival: [{ url: 'https://1rpc.io/near' }],
    },
  },
});

const nearStore = createNearStore({
  networkId: 'mainnet',
  clientCreator,
  serviceCreator: createNearConnectorService({ networkId: 'mainnet' }),
});

export const App = ({ children }: { children: React.ReactNode }) => (
  <NearProvider nearStore={nearStore}>{children}</NearProvider>
);
```

## Hooks

### `useNearSignIn`

Connect Near Protocol wallet.

```tsx
import { useNearSignIn } from 'react-near-ts';

const { signIn } = useNearSignIn();

<button onClick={() => signIn()}>Sign In</button>
```

### `useNearSignOut`

Disconnect Near Protocol wallet.

```tsx
import { useNearSignOut } from 'react-near-ts';

const { signOut } = useNearSignOut();

<button onClick={signOut}>Sign Out</button>
```

### `useConnectedAccount`

Read current connected account id.

```tsx
import { useConnectedAccount } from 'react-near-ts';

const { connectedAccountId, isConnectedAccount } = useConnectedAccount();
```

### `useAccountInfo`

Fetch account info via JSON RPC.

```tsx
import { useAccountInfo } from 'react-near-ts';

const accountInfo = useAccountInfo({ accountId: 'example.testnet' });

if (accountInfo.isSuccess) {
  console.log(accountInfo.data.accountInfo.balance.total.near);
}
```

### `useContractReadFunction`

Call read-only contract methods.

```tsx
import {
  useContractReadFunction,
  fromJsonBytes,
  type DeserializeResultFnArgs,
} from 'react-near-ts';
import * as z from 'zod/mini';

const ResultSchema = z.array(z.string());

const deserializeResult = ({ rawResult }: DeserializeResultFnArgs) =>
  ResultSchema.parse(fromJsonBytes(rawResult));

const records = useContractReadFunction({
  contractAccountId: 'react-near-ts.lantstool.testnet',
  functionName: 'get_records',
  functionArgs: { author_id: 'example.testnet' },
  withStateAt: 'LatestOptimisticBlock',
  options: { deserializeResult },
});
```

### `useExecuteTransaction`

Send a signed transaction from a connected wallet.

```tsx
import {
  transfer,
  functionCall,
  useExecuteTransaction
} from 'react-near-ts';

const { executeTransaction } = useExecuteTransaction();

// Transfer
executeTransaction({
  intent: {
    action: transfer({ amount: { near: '0.1' } }),
    receiverAccountId: 'receiver.testnet'
  }
});

// Function call
executeTransaction({
  intent: {
    action: functionCall({
      functionName: 'add_record',
      functionArgs: { record: 'hello' },
      gasLimit: { teraGas: '10' }
    }),
    receiverAccountId: 'react-near-ts.lantstool.testnet'
  },
  mutate: {
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ['get_records'] });
    }
  }
});
```

## Re-exports from `near-api-ts`

`react-near-ts` re-exports all imports of `near-api-ts`

## Playground

See a full working example (Next.js App Router):

- `playgrounds/react-near-ts/next-app-router`

It demonstrates:

- wallet connect/disconnect
- account info fetch
- token transfer
- contract read/write flows
