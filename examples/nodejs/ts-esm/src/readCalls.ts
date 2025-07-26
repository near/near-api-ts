import { createClient, testnet } from '@near-api-ts/core';

const accountId = 'nat-t1.lantstool.testnet';

const client = createClient({ network: testnet });

const accountKeyResult = await client.getAccountKey({
  accountId,
  publicKey: 'ed25519:9x4hUmLKYzQhi5BR3d4faoifAt8beyUqLTBk99p16dj9',
  options: {
    finality: 'OPTIMISTIC',
  },
});
console.log(accountKeyResult);

const res2 = await client.getAccountBalance({ accountId });
console.log(res2);

// const res3 = await client.getProtocolConfig();
// console.log(res3);
