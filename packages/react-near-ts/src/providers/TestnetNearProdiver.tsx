import { createTestnetClient } from 'near-api-ts';
import type { ReactNode } from 'react';
import { createNearConnectorService } from '../services/nearConnector/nearConnector.ts';
import { createNearStore } from '../store/nearStore.ts';
import { NearProvider } from './NearProvider.tsx';

const createTestnetNearStore = () =>
  createNearStore({
    networkId: 'testnet',
    clientCreator: createTestnetClient,
    serviceCreator: createNearConnectorService({ networkId: 'testnet' }),
  });

export const TestnetNearProvider = (props: { children: ReactNode }) => (
  <NearProvider nearStore={createTestnetNearStore()}>{props.children}</NearProvider>
);
