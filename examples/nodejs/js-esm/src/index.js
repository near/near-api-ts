import { createClient, testnet } from 'near-api-ts';

const client = createClient({ network: testnet });

try {
  const res2 = await client.getAccount({
    accountId: 'lantstool.testnet',
    options: {
      finality: 'OPTIMISTIC',
    },
  });
  console.log(res2);
} catch (e) {
  console.log(e);
}
