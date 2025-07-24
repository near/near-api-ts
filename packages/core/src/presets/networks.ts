import type { Network } from '../client/createClient';

export const testnet: Network = {
  rpcs: {
    regular: [
      { url: 'https://rpc.testnet.near.org' },
      { url: 'https://test.rpc.fastnear.com' },
    ],
    archival: [],
  },
};
