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
// describe('safeSendSignedTransaction › Transaction.Signer.NotFound', () => {
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
//   it('fails with Transaction.Signer.NotFound when the signer account does not exist', async () => {
//     const { blockHash } = await client.getAccountAccessKey({
//       accountId: 'nat',
//       publicKey: DEFAULT_PUBLIC_KEY,
//     });
//
//     const signedTransaction = await signTransaction({
//       signDataProvider: keyService,
//       transaction: {
//         signerAccountId: '123.nat',
//         signerPublicKey: DEFAULT_PUBLIC_KEY,
//         nonce: 1,
//         blockHash,
//         action: transfer({ amount: { near: '100' } }),
//         receiverAccountId: 'bob',
//       },
//     });
//
//     const res = await client.safeSendSignedTransaction({ signedTransaction });
//     assertNatErrKind(res, 'Client.SendSignedTransaction.Rpc.Transaction.Signer.NotFound');
//   });
// });
