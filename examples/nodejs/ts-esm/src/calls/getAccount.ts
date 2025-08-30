import { createClient, testnet, mainnet } from '@near-api-ts/core';

const accountId = 'nat-t1.lantstool.testnet';

const client = createClient({ network: testnet });

// const result = await client.getGasPrice({
//   blockId: '7dBRLdP15aPD1T41e6MwCn1nPGpYpPL4WxDfFXkGtQoX'
// });

const result = await client.getProtocolConfig();

// const result = await client.getAccountKeys({
//   accountId,
// });

console.dir(result, { depth: null, colors: true });

// const res2 = await client.getBlock();
// console.log(res2);

// const res3 = await client.getProtocolConfig();
// console.log(res3);
//  publicKey: 'ed25519:9x4hUmLKYzQhi5BR3d4faoifAt8beyUqLTBk99p16dj9',
