import { throwableCreateClient } from '../createClient';

export const createTestnetClient = () =>
  throwableCreateClient({
    transport: {
      rpcEndpoints: {
        regular: [
          { url: 'https://rpc.testnet.fastnear.com' },
          { url: 'https://testnet-rpc.intea.rs' },
        ],
        archival: [{ url: 'https://archival-rpc.testnet.fastnear.com' }],
      },
    },
  });
