import { createClient } from '../createClient';

export const createMainnetClient = () =>
  createClient({
    transport: {
      rpcEndpoints: {
        regular: [{ url: 'https://rpc.mainnet.fastnear.com' }, { url: 'https://rpc.intea.rs' }],
        archival: [{ url: 'https://archival-rpc.mainnet.fastnear.com' }],
      },
    },
  });
