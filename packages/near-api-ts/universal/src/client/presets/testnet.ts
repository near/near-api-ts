import { throwableCreateClient } from '../createClient';

export const createTestnetClient = () =>
  throwableCreateClient({
    transport: {
      rpcEndpoints: {
        regular: [
          { url: 'https://test.rpc.fastnear.com' },
          { url: 'https://rpc.testnet.near.org' },
        ],
        archival: [{ url: 'https://neart.lava.build:443' }],
      },
    },
  });
