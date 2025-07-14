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

const res = await Promise.all([
  client.getAccount(),
  client.getAccessKey(),
  client.getAccount(),
  client.getAccount(),
  client.getAccessKey(),
]);
