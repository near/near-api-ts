import {
  createClient,
  createMemoryKeyService,
  testnet,
  functionCall,
  teraGas,
  transfer,
} from '@near-api-ts/core';

const client = createClient({ network: testnet });

// FA
const signerPrivateKey =
  'ed25519:5yH12pq5HsTpE8GDrvwePNHhZHm8ENkKwjkgvMwwVpR3ZWjG46EqFMKbjZA2deRvLrGK19Jjybj5N3tQQirZoSpB';
const signerPrivateKey2 =
  'ed25519:2wF2uj6ow4S12CpjZEkj3iyNSj8BwBBjySMF8pn37nZYvJAv4diCEuTVYkZwSVnnzTw1zV8u8kf4iqnvjJkSwDHa';
// FC
// testnet - [claim, create_account]
const signerPrivateKey3 =
  'ed25519:ReL9GL39PytyR4VUvpykbiAQ7hom4VSqvxAxiUjndtrCC15Zgak5AW74MpMRMj515Sn6vMHvTz5Hat1sMNcX4yz';
//lantstool.testnet [add_record]
const signerPrivateKey4 =
  'ed25519:3TKpSdvwTwiZegXjAyEKAxkRTkNNNLKQ3MWNJe7q2aMGtXnieco5VozSkiF1RBcxkjUioboFpop9wjx1KYgivogL';

const keyService = await createMemoryKeyService({
  keySources: [
    { privateKey: signerPrivateKey },
    { privateKey: signerPrivateKey2 },
    { privateKey: signerPrivateKey3 },
    { privateKey: signerPrivateKey4 },
  ],
});

const signer: any = await keyService.createSigner({
  signerAccountId: 'nat-t1.lantstool.testnet',
  client,
  options: {
    signerPublicKey: 'ed25519:9x4hUmLKYzQhi5BR3d4faoifAt8beyUqLTBk99p16dj9',
    queueTimeout: 60000,
  },
});

// const result = await signer.executeMultipleTransactions({
//   transactionIntents: [
//     {
//       action: functionCall({
//         fnName: 'add_record',
//         gasLimit: { teraGas: 10n },
//       }),
//       receiverAccountId: 'lantstool.testnet',
//     },
//     {
//       action: functionCall({
//         fnName: 'claim',
//         gasLimit: { teraGas: 10n },
//       }),
//       receiverAccountId: 'testnet',
//     },
//     {
//       action: transfer({ amount: { yoctoNear: '1' } }),
//       receiverAccountId: 'eclipseer.testnet',
//     },
//     {
//       action: transfer({ amount: { yoctoNear: '1' } }),
//       receiverAccountId: 'lantstool.testnet',
//     },
//   ],
// });

const result = await Promise.allSettled([
  signer.signTransaction({
    action: transfer({ amount: { yoctoNear: '1' } }),
    receiverAccountId: 'eclipseer.testnet',
  }),
  signer.executeTransaction({
    action: functionCall({
      fnName: 'claim',
      gasLimit: { teraGas: 100n },
    }),
    receiverAccountId: 'testnet',
  }),
  signer.signTransaction({
    action: functionCall({
      fnName: 'add_record',
      gasLimit: { teraGas: 100n },
    }),
    receiverAccountId: 'lantstool.testnet',
  }),
]);

console.log(result);
// console.dir(result2, { depth: null, colors: true });
