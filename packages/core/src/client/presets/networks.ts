import type { Network } from '../createClient/createClient';

export const testnet: Network = {
  rpcs: {
    regular: [
      { url: 'https://rpc.testnet.near.org' },
      { url: 'https://test.rpc.fastnear.com' },
    ],
    archival: [],
  },
};
