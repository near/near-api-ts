import { createClient, testnet } from '@near-api-ts/core';

const client = createClient({ network: testnet });

// const result = await client.getAccountKey({
//   accountId,
//   publicKey: 'ed25519:5JgE5tBqbtd4ghgRqu2SFjxFs1x7GonNuLhXbi4Z2pik'
// });

const result = await client.getAccountState({
  accountId: 'testnet',
  atMomentOf: 'LatestFinalBlock', // or atBlock: LatestFinalBlock
})

// await client.callContractReadFunction({
//   contractAccountId: 'usdl.lantstool.testnet',
//   withStateAt: 'LatestFinalBlock',
// });
//
// await client.getBlock({
//   blockReference: 'LatestFinalBlock',
// })

console.dir(result, { depth: null, customInspect: true });

