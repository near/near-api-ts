import {
  createClient,
  createMemoryKeyService,
  testnet,
  transfer,
  teraGas
} from '@near-api-ts/core';

const client = createClient({ network: testnet });

// FA
const signerPrivateKey =
  'ed25519:5yH12pq5HsTpE8GDrvwePNHhZHm8ENkKwjkgvMwwVpR3ZWjG46EqFMKbjZA2deRvLrGK19Jjybj5N3tQQirZoSpB';
const signerPrivateKey2 =
  'ed25519:2wF2uj6ow4S12CpjZEkj3iyNSj8BwBBjySMF8pn37nZYvJAv4diCEuTVYkZwSVnnzTw1zV8u8kf4iqnvjJkSwDHa';
// FC
const signerPrivateKey3 =
  'ed25519:ReL9GL39PytyR4VUvpykbiAQ7hom4VSqvxAxiUjndtrCC15Zgak5AW74MpMRMj515Sn6vMHvTz5Hat1sMNcX4yz';

const keyService = await createMemoryKeyService({
  keySources: [
    { privateKey: signerPrivateKey },
    { privateKey: signerPrivateKey2 },
    { privateKey: signerPrivateKey3 },
  ],
});

// const signer: any = await keyService.createSigner({
//   signerAccountId: 'nat-t1.lantstool.testnet',
//   client,
// });
//
// const res = await Promise.all([
//   signer.executeTransaction({
//     action: transfer({ amount: { yoctoNear: '1' } }),
//     receiverAccountId: 'eclipseer.testnet',
//   }),
//   signer.signTransaction({
//     action: transfer({ amount: { yoctoNear: '2' } }),
//     receiverAccountId: 'eclipseer.testnet',
//   }),
//   signer.signTransaction({
//     action: transfer({ amount: { yoctoNear: '3' } }),
//     receiverAccountId: 'eclipseer.testnet',
//   }),
// ]);
//
// console.log(res);
