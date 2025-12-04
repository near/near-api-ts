import { throwableCreateClient } from '../createClient';

export const createMainnetClient = () =>
  throwableCreateClient({
    transport: {
      rpcEndpoints: {
        regular: [
          { url: 'https://free.rpc.fastnear.com' },
          { url: 'https://rpc.intea.rs' },
          { url: 'https://near.blockpi.network/v1/rpc/public' },
        ],
        archival: [{ url: 'https://near.lava.build:443' }],
      },
    },
  });
