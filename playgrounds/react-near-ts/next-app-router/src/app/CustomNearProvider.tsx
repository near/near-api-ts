'use client';

import React from 'react';
import {
  createNearConnectorService,
  createNearStore,
  createTestnetClient,
  NearProvider,
} from 'react-near-ts';

export const nearStore = createNearStore({
  networkId: 'testnet',
  clientCreator: createTestnetClient,
  serviceCreator: createNearConnectorService({
    supportedFeatures: {
      signInAdditionalAction: {
        signMessage: true,
        addFunctionCallKey: true,
      },
      signMessage: true,
      signDelegation: true,
    },
  }),
});

export const CustomNearProvider = ({ children }: { children: React.ReactNode }) => (
  <NearProvider nearStore={nearStore}>{children}</NearProvider>
);
