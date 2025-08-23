import type { Network } from 'nat-types/client/client';

export const testnet: Network = {
  rpcs: {
    regular: [
      { url: 'https://rpc.testnet.near.org' },
      { url: 'https://test.rpc.fastnear.com' },
    ],
    archival: [],
  },
};
