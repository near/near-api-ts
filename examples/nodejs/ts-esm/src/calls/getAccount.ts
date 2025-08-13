import { createClient, testnet } from '@near-api-ts/core';

const accountId = 'nat-t1.lantstool.testnet';

const client = createClient({ network: testnet });

const accountResult = await client.getAccount({
  accountId,
  options: {
    finality: 'Optimistic',
  },
});
console.log(accountResult);

const res2 = await client.getAccountBalance({ accountId });
console.log(res2);

// const res3 = await client.getProtocolConfig();
// console.log(res3);
//  publicKey: 'ed25519:9x4hUmLKYzQhi5BR3d4faoifAt8beyUqLTBk99p16dj9',
