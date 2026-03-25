import { createMainnetClient } from 'near-api-ts';
import type { ReactNode } from 'react';
import { createNearConnectorService } from '../services/nearConnector/nearConnector.ts';
import { createNearStore } from '../store/nearStore.ts';
import { NearProvider } from './NearProvider.tsx';

const createMainnetNearStore = () =>
  createNearStore({
    networkId: 'mainnet',
    clientCreator: createMainnetClient,
    serviceCreator: createNearConnectorService({ networkId: 'mainnet' }),
  });

export const MainnetNearProvider = (props: { children: ReactNode }) => (
  <NearProvider nearStore={createMainnetNearStore()}>{props.children}</NearProvider>
);
