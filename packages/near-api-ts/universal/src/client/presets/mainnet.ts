import { throwableCreateClient } from '../createClient';

export const createMainnetClient = () =>
  throwableCreateClient({
    transport: {
      rpcEndpoints: {
        regular: [
          { url: 'https://rpc.mainnet.fastnear.com' },
          { url: 'https://rpc.intea.rs' },
        ],
        archival: [{ url: 'https://archival-rpc.mainnet.fastnear.com' }],
      },
    },
  });
