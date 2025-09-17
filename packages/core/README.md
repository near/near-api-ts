## NEAR API TS
Typescript library for interactions with Near Protocol in the browser or Node.js

**Installation**
```text
pnpm add @near-api-ts/core
```

**Node.js (esm) / Browser**

```ts
import {
  createClient,
  createMemoryKeyService,
  createMemorySigner,
  testnet,
  transfer,
} from '@near-api-ts/core';

const client = createClient({ network: testnet });

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

You may found more examples in the `examples/nodejs/ts-esm` folder
