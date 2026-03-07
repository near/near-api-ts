import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import type { AccountId } from 'near-api-ts';
import type { CreateNearStore, StoreContext, NearState } from '../../types/store.ts';
import type { ServiceId, Service } from '../../types/services/_common.ts';

export const createNearStore: CreateNearStore = (args) => {
  // TODO Validate args
  const { storeName = 'react-near-ts', networkId, clientCreator, serviceCreator } = args;
  // Temporary until we will support multiple services
  const serviceCreators = [serviceCreator];

  // TODO check if service already exists; If so - throw an error
  const services = serviceCreators.reduce(
    (acc, creator) => {
      acc[creator.serviceId] = creator.createService();
      return acc;
    },
    {} as Record<ServiceId, Service>,
  );

  // Create Context
  const context: StoreContext = {
    serviceCreators,
    client: clientCreator(),
    services,
    signers: [],
  };
  const getContext = () => context;

  const setSigners = (connectedAccountId: AccountId) => {
    context.signers = context.serviceCreators.map((creator) =>
      creator.createSigner({
        signerAccountId: connectedAccountId,
        client: context.client,
        serviceBox: context.services[creator.serviceId].serviceBox,
      }),
    );
  };

  const clearSigners = () => {
    context.signers = [];
  };

  // Create Store
  return createStore<NearState>()(
    persist(
      (set) => ({
        networkId,
        connectedAccountId: undefined,
        getContext,
        setSigners,
        clearSigners,
        setConnectedAccountId: (connectedAccountId) => {
          set(() => ({ connectedAccountId }));
        },
      }),
      {
        name: `${storeName}:${networkId}`,
        version: 1,
        partialize: (s) => ({ connectedAccountId: s.connectedAccountId }),
        onRehydrateStorage: () => (state) => {
          if (state?.connectedAccountId) state.setSigners(state.connectedAccountId);
        },
      },
    ),
  );
};
