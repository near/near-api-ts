import {
  createClient,
  createMemoryKeyService,
  testnet,
  addFunctionCallKey,
} from '@near-api-ts/core';

const client = createClient({ network: testnet });

const signerAccountId = 'nat-t1.lantstool.testnet';
const signerPublicKey = 'ed25519:9x4hUmLKYzQhi5BR3d4faoifAt8beyUqLTBk99p16dj9';
const signerPrivateKey = `ed25519:5yH12pq5HsTpE8GDrvwePNHhZHm8ENkKwjkgvMwwVpR3ZWjG46EqFMKbjZA2deRvLrGK19Jjybj5N3tQQirZoSpB`;

const keyService = await createMemoryKeyService({
  keySources: [{ privateKey: signerPrivateKey }],
});

const {
  accountKey: { nonce },
  blockHash,
} = await client.getAccountKey({
  accountId: signerAccountId,
  publicKey: signerPublicKey,
});

const signedTransaction = await keyService.signTransaction({
  signerAccountId,
  signerPublicKey: signerPublicKey,
  actions: [
    addFunctionCallKey({
      publicKey: 'ed25519:GSPxLjwSZ8TScCWSK181oJkcQbuKBYRcTT5iZoZkQvKu',
      contractAccountId: 'testnet',
      allowedFunctions: ['create', 'abc'],
    }),
  ],
  receiverAccountId: signerAccountId,
  nonce: nonce + 1,
  blockHash,
});

console.log(signedTransaction);
const result = await client.sendSignedTransaction({ signedTransaction });
console.log(result);
