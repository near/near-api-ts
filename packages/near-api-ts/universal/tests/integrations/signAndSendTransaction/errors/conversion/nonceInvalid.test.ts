// import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
// import { beforeAll, describe, it } from 'vitest';
// import {
//   type Client,
//   createMemoryKeyService,
//   type MemoryKeyService,
//   transfer,
// } from '../../../../../index';
// import { signTransaction } from '../../../../../src/helpers/signTransaction';
// import { assertNatErrKind } from '../../../../utils/assertNatErrKind';
// import { createDefaultClient } from '../../../../utils/common';
// import { startSandbox } from '../../../../utils/sandbox/startSandbox';
// import { testKeys } from '../../../../utils/testKeys';
//
// describe('safeSendSignedTransaction › Transaction.Nonce.Invalid', () => {
//   let client: Client;
//   let keyService: MemoryKeyService;
//
//   beforeAll(async () => {
//     const sandbox = await startSandbox();
//     client = createDefaultClient(sandbox);
//     keyService = createMemoryKeyService({
//       keySources: [
//         { privateKey: DEFAULT_PRIVATE_KEY },
//         { privateKey: testKeys.fc.forContract.privateKey },
//       ],
//     });
//     return () => sandbox.stop();
//   });
//
//   it('fails with Transaction.Nonce.Invalid when the nonce is already used', async () => {
//     const { accountAccessKey, blockHash } = await client.getAccountAccessKey({
//       accountId: 'nat',
//       publicKey: DEFAULT_PUBLIC_KEY,
//     });
//
//     const signedTransaction = await signTransaction({
//       signDataProvider: keyService,
//       transaction: {
//         signerAccountId: 'nat',
//         signerPublicKey: DEFAULT_PUBLIC_KEY,
//         nonce: accountAccessKey.nonce + 0,
//         blockHash,
//         action: transfer({ amount: { near: '100' } }),
//         receiverAccountId: 'bob',
//       },
//     });
//
//     const res = await client.safeSendSignedTransaction({ signedTransaction });
//     assertNatErrKind(res, 'Client.SendSignedTransaction.Rpc.Transaction.Nonce.Invalid');
//   });
// });
