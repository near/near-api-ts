import { createNearStore } from '../store/nearStore.ts';
import { createMainnetClient } from 'near-api-ts';
import { createNearConnectorService } from '../services/nearConnector/nearConnector.ts';
import { NearProvider } from './NearProvider.tsx';
import type { ReactNode } from 'react';

const createMainnetNearStore = () =>
  createNearStore({
    networkId: 'mainnet',
    clientCreator: createMainnetClient,
    serviceCreator: createNearConnectorService({ networkId: 'mainnet' }),
  });

export const MainnetNearProvider = (props: { children: ReactNode }) => (
  <NearProvider nearStore={createMainnetNearStore()}>{props.children}</NearProvider>
);
