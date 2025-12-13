// import { test } from 'vitest';
// import {
//   safeCreateClient,
//   createMemoryKeyService,
//   createMemorySigner,
// } from '../../../../../src';
// import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
//
// test(
//   'Handle invalid nonce',
//   {
//     timeout: 30 * 1000,
//   },
//   async () => {
//     const client = await safeCreateClient({
//       transport: {
//         rpcEndpoints: { archival: [{ url: 'http://localhost:4560' }] },
//       },
//     });
//
//     const keyService = await createMemoryKeyService({
//       keySource: { privateKey: DEFAULT_PRIVATE_KEY },
//     });
//
//     const _signer1 = await createMemorySigner({
//       signerAccountId: 'nat',
//       client,
//       keyService,
//     });
//
//     // const signer2 = await createMemorySigner({
//     //   signerAccountId: 'nat',
//     //   client,
//     //   keyService,
//     // });
//
//     // const r = await client.sendSignedTransaction();
//
//     // const result1 = await signer1.executeTransaction({
//     //   // intent: {
//     //     action: transfer({ amount: { near: '1' } }),
//     //     receiverAccountId: DEFAULT_ACCOUNT_ID,
//     //   // },
//     // });
//     //
//     // log(result1);
//
//     // const result2 = await signer2.executeTransaction({
//     //   action: transfer({ amount: { near: '2' } }),
//     //   receiverAccountId: DEFAULT_ACCOUNT_ID,
//     // });
//     //
//     // log(result2);
//   },
// );
