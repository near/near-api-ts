import { createClient } from '../createClient';

export const createTestnetClient = () =>
  createClient({
    transport: {
      rpcEndpoints: {
        regular: [
          { url: 'https://rpc.testnet.near.org' },
          { url: 'https://test.rpc.fastnear.com' },
        ],
        archival: [],
      },
    },
  });
