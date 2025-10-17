import { createClient } from '../createClient';

export const createMainnetClient = () =>
  createClient({
    transport: {
      rpcEndpoints: {
        regular: [
          { url: 'https://free.rpc.fastnear.com' },
          { url: 'https://near.blockpi.network/v1/rpc/public' },
        ],
        archival: [],
      },
    },
  });
