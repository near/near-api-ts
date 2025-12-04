import { createClient } from '../createClient';

export const createTestnetClient = () =>
  createClient({
    transport: {
      rpcEndpoints: {
        regular: [
          { url: 'https://test.rpc.fastnear.com' },
          { url: 'https://rpc.testnet.near.org' },
        ],
        archival: [],
      },
    },
  });
