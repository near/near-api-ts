import type { Network } from 'nat-types/client/client';

export const mainnet: Network = {
  rpcs: {
    regular: [
      { url: 'https://free.rpc.fastnear.com' },
      { url: 'https://near.blockpi.network/v1/rpc/public' },
    ],
    archival: [],
  },
};

export const testnet: Network = {
  rpcs: {
    regular: [
      { url: 'https://rpc.testnet.near.org' },
      { url: 'https://test.rpc.fastnear.com' },
    ],
    archival: [],
  },
};
