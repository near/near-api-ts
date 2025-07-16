import { createClient } from '../packages/core/src/client/createClient';

const client = createClient({
  network: {
    rpcs: {
      regular: [
        { url: 'https://rpc.testnet.near.org' },
        { url: 'https://test.rpc.fastnear.com' },
      ],
      archival: [],
    },
  },
});

try {
  const res = await client.getAccountKey({
    accountId: 'lantstool.testnet',
    publicKey: 'ed25519:Es8FtufJD3QrbRhNbSqM5vHEozHHtrmKKDD5qGKjRp3p',
  });
  console.log(res);

  const res2 = await client.getAccount({
    accountId: 'lantstool.testnet',
  });
  console.log(res2);

  const res3 = await client.getProtocolConfig();
  console.log(res3);
} catch (e) {
  console.log(e);
}
