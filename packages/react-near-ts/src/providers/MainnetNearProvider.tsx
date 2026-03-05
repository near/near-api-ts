import { createNearStore } from '../store/nearStore.ts';
import { createMainnetClient } from 'near-api-ts';
import { createNearConnectorService } from '../services/nearConnector/createNearConnectorService.ts';
import { NearProvider } from './NearProvider.tsx';

const createMainnetNearStore = () =>
  createNearStore({
    networkId: 'mainnet',
    createClient: createMainnetClient,
    serviceCreators: [createNearConnectorService({ networkId: 'mainnet' })],
  });

export const MainnetNearProvider = ({ children }: any) => (
  <NearProvider nearStore={createMainnetNearStore()}>{children}</NearProvider>
);
