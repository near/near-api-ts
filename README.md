## NEAR API TS
Typescript library for interactions with Near Protocol in the browser or Node.js

[GitHub Repository](https://github.com/eclipseeer/near-api-ts/tree/main)

**Installation**
```text
pnpm add near-api-ts
```

**Node.js (esm, 22+) / Browser**

```ts
import {
  createClient,
  createMemoryKeyService,
  createMemorySigner,
  testnet,
  transfer,
} from 'near-api-ts';

// Create a near client
const client = createClient({ network: testnet });


// Read some data from the chain
await client.getAccountState({
  accountId: 'testnet',
  atMomentOf: 'LatestFinalBlock',
})

// Send some transaction
const keyService = await createMemoryKeyService({
  keySource: { privateKey: 'ed25519:your-private-key' } ,
});

const signer = await createMemorySigner({
  signerAccountId: 'your-account.testnet',
  client,
  keyService,
});

await signer.executeTransaction({
  action: transfer({ amount: { yoctoNear: '1' } }),
  receiverAccountId: 'some-receiver.testnet',
});
```

You may found more examples in the [examples/nodejs/ts-esm](https://github.com/eclipseeer/near-api-ts/tree/main/examples/nodejs/ts-esm)
folder
