import {
  createClient,
  createMemoryKeyService,
  testnet,
  transfer,
  addEd25519FullAccessKey,
  addSecp256k1FullAccessKey,
} from '@near-api-ts/core';

const client = createClient({ network: testnet });

const signerAccountId = 'nat-t1.lantstool.testnet';
const signerPublicKey = 'ed25519:9x4hUmLKYzQhi5BR3d4faoifAt8beyUqLTBk99p16dj9';
const signerPrivateKey = `ed25519:5yH12pq5HsTpE8GDrvwePNHhZHm8ENkKwjkgvMwwVpR3ZWjG46EqFMKbjZA2deRvLrGK19Jjybj5N3tQQirZoSpB`;
const signerPublicKey2 = `secp256k1:2tz1AWNq8Sxr7HYHrcai3JEacZLtQLyAd8MNgbYwCpvWc2RSFqhUYWdg1mugV4ZxKcs9tae6T461PSw5oA1ZqTyf`;
const signerPrivateKey2 = `secp256k1:3ujCkTifb4PntSpCnSgi5PL29YkhjXpxySSVMgQaLB9sSs6jUxyD2A9Z59cctNY9oxkwH5TCt5iCZh1pEWfAn4Lj2LZpzChfHJaFV34P5briuJt5FTC4orNqZYF4JLP6ERs`;

const keyService = await createMemoryKeyService({
  keySources: [
    { privateKey: signerPrivateKey },
    { privateKey: signerPrivateKey2 },
    { privateKey: 'secp256k1:5="№,?yH12pq5HsTpE8GDrvwePNHdafdh123dsd2Dada12' },
  ],
});

const { nonce, blockHash } = await client.getAccountKey({
  accountId: signerAccountId,
  publicKey: signerPublicKey2,
});

const signedTransaction = await keyService.signTransaction({
  signerAccountId,
  signerPublicKey: signerPublicKey2,
  action: transfer({ amount: { yoctoNear: '2' } }),
  receiverAccountId: 'eclipseer.testnet',
  nonce: nonce + 1,
  blockHash,
});

// const { nonce, blockHash } = await client.getAccountKey({
//   accountId: signerAccountId,
//   publicKey: signerPublicKey,
// });
//
// const signedTransaction = await keyService.signTransaction({
//   signerAccountId,
//   signerPublicKey: signerPublicKey2,
//   action: addSecp256k1FullAccessKey({
//     publicKey:
//       'secp256k1:2tz1AWNq8Sxr7HYHrcai3JEacZLtQLyAd8MNgbYwCpvWc2RSFqhUYWdg1mugV4ZxKcs9tae6T461PSw5oA1ZqTyf',
//   }),
//   receiverAccountId: signerAccountId,
//   nonce: nonce + 1,
//   blockHash,
// });

console.log(signedTransaction);

const result = await client.sendSignedTransaction({ signedTransaction });
console.log(result);
