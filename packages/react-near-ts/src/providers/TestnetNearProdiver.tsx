import { createNearStore } from '../store/nearStore.ts';
import { createTestnetClient } from 'near-api-ts';
import { createNearConnectorService } from '../services/nearConnector/createNearConnectorService.ts';
import { NearProvider } from './NearProvider.tsx';

const createTestnetNearStore = () =>
  createNearStore({
    networkId: 'testnet',
    createClient: createTestnetClient,
    serviceCreators: [createNearConnectorService({ networkId: 'testnet' })],
  });

export const TestnetNearProvider = ({ children }: any) => (
  <NearProvider nearStore={createTestnetNearStore()}>{children}</NearProvider>
);
