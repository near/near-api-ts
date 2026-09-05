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
  serviceCreator: createNearConnectorService(),
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

Pass `additionalAction` to combine the connection with one more step. The hook
then requires the arguments of that step in `signIn`, and returns its result
alongside `connectedAccountId`.

```tsx
// Sign a NEP-413 message while connecting
const { signInAsync } = useNearSignIn({ additionalAction: 'SignMessage' });

const { connectedAccountId, signedMessage } = await signInAsync({
  message: createMessage({ message: 'Login', recipient: 'my-app.com' }),
});
```

```tsx
// Add a function call key while connecting
const { signIn } = useNearSignIn({ additionalAction: 'AddFunctionCallKey' });

signIn({
  publicKey: 'ed25519:...',
  contractAccountId: 'react-near-ts.lantstool.testnet',
  gasBudget: { near: '0.25' },
  allowedFunctions: ['add_record'],
});
```

### `useNearSignOut`

Disconnect Near Protocol wallet.

```tsx
import { useNearSignOut } from 'react-near-ts';

const { signOut } = useNearSignOut();

<button onClick={() => signOut()}>Sign Out</button>
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
  console.log(accountInfo.data.balance.total.near);
}
```

### `useContractReadFunction`

Call read-only contract methods.

```tsx
import {
  useContractReadFunction,
  convertBase64ToObject,
  type DeserializeResultFnArgs,
} from 'react-near-ts';
import * as z from 'zod/mini';

const ResultSchema = z.array(z.string());

const deserializeResult = (args: DeserializeResultFnArgs) =>
  ResultSchema.parse(convertBase64ToObject(args.rawResult));

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

### `useSignMessage`

Sign a NEP-413 off-chain message with the connected wallet.

```tsx
import { createMessage, useSignMessage } from 'react-near-ts';

const { signMessageAsync } = useSignMessage();

const message = createMessage({ message: 'Login', recipient: 'my-app.com' });
const signedMessage = await signMessageAsync({ message });
// { signerAccountId, signerPublicKey, message, signature }
```

### `useSignDelegation`

Sign a meta transaction (delegation) with the connected wallet. The signed
delegation is returned as borsh base64, ready to be handed to a relayer that
wraps it into `executeDelegation`.

```tsx
import { functionCall, useSignDelegation } from 'react-near-ts';

const { signDelegation } = useSignDelegation();

signDelegation({
  intent: {
    delegatedAction: functionCall({
      functionName: 'add_record',
      functionArgs: { record: 'hello' },
      gasLimit: { teraGas: '10' },
    }),
    receiverAccountId: 'react-near-ts.lantstool.testnet',
    expiration: { blockHeight: 100 },
  },
  mutate: {
    onSuccess: ({ signedDelegationBorsh64 }) => {
      // send it to your relayer
    },
  },
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
