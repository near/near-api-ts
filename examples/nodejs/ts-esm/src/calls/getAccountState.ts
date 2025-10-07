import { createClient, testnet } from '@near-api-ts/core';

const client = createClient({ network: testnet });

// const client = await createClient({
//   networkId: 'testnet', // For safety
//   transport: createFailoverTransport({
//     rpcs: { regular: [] },
//   }),
//   methods: allClientMethods,
// });
//
// const client = createTestnetClient();

// has state
// const client = createClient({
//   transport: testnetFailoverTransport,
//   methods: {
//      getAccountState,
//      getBlock: noValidations.getBlock
//   },
// });

// const result = await client.getAccountKeys({
//   accountId: 'eclipseer.testnet',
// });

// const result = await client.getAccountState({
//   accountId: 'lantstool.testnet',
//   atMomentOf: 'LatestFinalBlock',
// })

// const res = await client.callContractReadFunction({
//   contractAccountId: 'testnet',
//   functionName: 'read'
// })

const result = await client.callContractReadFunction({
  contractAccountId: 'usdl.lantstool.testnet',
  functionName: 'ft_metadata1',
  withStateAt: 'LatestFinalBlock',
});
//
// const result = await client.getBlock({
//   blockReference: 'LatestFinalBlock',
// })

console.dir(result, { depth: null, customInspect: true });

