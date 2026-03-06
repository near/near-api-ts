import { createNearStore } from '../store/nearStore.ts';
import { createTestnetClient } from 'near-api-ts';
import { createNearConnectorService } from '../services/nearConnector/nearConnector.ts';
import { NearProvider } from './NearProvider.tsx';
import type { ReactNode } from 'react';

const createTestnetNearStore = () =>
  createNearStore({
    networkId: 'testnet',
    clientCreator: createTestnetClient,
    serviceCreators: [createNearConnectorService({ networkId: 'testnet' })],
  });

export const TestnetNearProvider = (props: { children: ReactNode }) => (
  <NearProvider nearStore={createTestnetNearStore()}>{props.children}</NearProvider>
);
