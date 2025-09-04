import { createClient, testnet } from '@near-api-ts/core';

const accountId = 'nat-t1.lantstool.testnet';

const client = createClient({ network: testnet });

// const result = await client.getGasPrice({
//   blockId: '7dBRLdP15aPD1T41e6MwCn1nPGpYpPL4WxDfFXkGtQoX'
// });

// const result = await client.getProtocolConfig();

// const result = await client.getAccountKeys({
//   accountId,
// });

// const result = await client.getAccountKey({
//   accountId,
//   publicKey: 'ed25519:5JgE5tBqbtd4ghgRqu2SFjxFs1x7GonNuLhXbi4Z2pik'
// });

// const result = await client.getAccountState({
//   accountId: accountId,
// });

const result = await client.getContractState({
  contractAccountId: 'usdl.lantstool.testnet',
  includeProof: true,
});

console.log(result);

//
// console.dir(
//   result,
//   { depth: null, customInspect: true },
// );

// const res2 = await client.getBlock();
// console.log(res2);

// const res3 = await client.getProtocolConfig();
// console.log(res3);
//  publicKey: 'ed25519:9x4hUmLKYzQhi5BR3d4faoifAt8beyUqLTBk99p16dj9',
