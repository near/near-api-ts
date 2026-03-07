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

### `useNearConnector`

Connect/disconnect wallet.

```tsx
import { useNearConnector } from 'react-near-ts';

const { connect, disconnect } = useNearConnector();

<button onClick={() => connect.mutate()}>Connect</button>
<button onClick={() => disconnect.mutate()}>Disconnect</button>
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

Send signed transaction from connected wallet.

```tsx
import {
  transfer,
  functionCall,
  useExecuteTransaction,
} from 'react-near-ts';

const executeTransaction = useExecuteTransaction();

// Transfer
executeTransaction.mutate({
  intent: {
    action: transfer({ amount: { near: '0.1' } }),
    receiverAccountId: 'receiver.testnet',
  },
});

// Function call
executeTransaction.mutate({
  intent: {
    action: functionCall({
      functionName: 'add_record',
      functionArgs: { record: 'hello' },
      gasLimit: { teraGas: '10' },
    }),
    receiverAccountId: 'react-near-ts.lantstool.testnet',
  },
});
```

## Re-exports from `near-api-ts`

`react-near-ts` also re-exports common client creators, action creators and
utils, including:

- `createMainnetClient`, `createTestnetClient`, `createClient`
- `transfer`, `functionCall`, `createAccount`, `stake`, ...
- `near`, `yoctoNear`, `teraGas`, `fromJsonBytes`, `toJsonBytes`, ...

## Playground

See a full working example (Next.js App Router):

- `playgrounds/react-near-ts/next-app-router`

It demonstrates:

- wallet connect/disconnect
- account info fetch
- token transfer
- contract read/write flows
