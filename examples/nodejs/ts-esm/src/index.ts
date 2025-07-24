import { createClient, testnet } from '@near-api-ts/core';

const client = createClient({ network: testnet });

try {
  // const res = await client.getAccountKey({
  //   accountId: 'lantstool.testnet',
  //   publicKey: 'ed25519:Es8FtufJD3QrbRhNbSqM5vHEozHHtrmKKDD5qGKjRp3p',
  //   options: {
  //     finality: 'OPTIMISTIC',
  //   },
  // });
  // console.log(res);

  const res2 = await client.getAccount({
    accountId: 'lantstool.testnet',
    options: {
      finality: 'OPTIMISTIC',
    },
  });
  console.log(res2);

  // const res3 = await client.getProtocolConfig();
  // console.log(res3);
} catch (e) {
  console.log(e);
}
