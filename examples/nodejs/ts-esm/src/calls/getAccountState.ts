import { createClient, testnet } from '@near-api-ts/core';

const client = createClient({ network: testnet });

// const result = await client.getAccountKeys({
//   accountId: 'eclipseer.testnet',
// });

const result = await client.getAccountState({
  accountId: 'lantstool.testnet',
  atMomentOf: 'LatestFinalBlock',
})

// await client.callContractReadFunction({
//   contractAccountId: 'usdl.lantstool.testnet',
//   fnName: 'some',
//   withStateAt: 'LatestFinalBlock',
// });
//
// const result = await client.getBlock({
//   blockReference: 'LatestFinalBlock',
// })

console.dir(result, { depth: null, customInspect: true });

