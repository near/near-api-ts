// import { beforeAll, describe, expect, it } from 'vitest';
// import {
//   createMemoryKeyVault,
//   type Client,
//   type MemoryKeyVault,
//   transfer,
// } from '../../../../index';
// import { createDefaultClient } from '../../../utils/common';
// import { startSandbox } from '../../../utils/sandbox/startSandbox';
// import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
// import { testKeys } from '../../../utils/testKeys';
//
// vi.setConfig({ testTimeout: 60000 });
//
// describe('Transaction success', () => {
//   let client: Client;
//   let keyVault: MemoryKeyVault;
//
//   beforeAll(async () => {
//     const sandbox = await startSandbox();
//     client = createDefaultClient(sandbox);
//     keyVault = createMemoryKeyVault({
//       keySources: [
//         { privateKey: DEFAULT_PRIVATE_KEY },
//         { privateKey: testKeys.fc.forContract.privateKey },
//       ],
//     });
//     return () => sandbox.stop();
//   });
//
//   it('Transfer', async () => {
//     const { accessKey, blockHash } = await client.getAccessKey({
//       accountId: 'nat',
//       publicKey: DEFAULT_PUBLIC_KEY,
//     });
//
//     const signedTransaction = await keyVault.signTransaction({
//       transaction: {
//         signerAccountId: 'nat',
//         signerPublicKey: DEFAULT_PUBLIC_KEY,
//         nonce: accessKey.nonce + 1,
//         blockHash,
//         action: transfer({ amount: { near: '5' } }),
//         receiverAccountId: 'bob',
//       },
//     });
//
//     await expect(
//       client.sendSignedTransaction({
//         signedTransaction,
//       }),
//     ).resolves.toMatchObject({
//       rawRpcResult: {
//         status: { SuccessValue: '' },
//       },
//     });
//   });
// });
