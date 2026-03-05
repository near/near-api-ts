import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import type { Client, AccountId, TransactionIntent } from 'near-api-ts';

type ServiceId = string;

type Service = {
  serviceId: ServiceId;
  serviceBox: unknown;
};

export type Signer = {
  serviceId: ServiceId;
  safeExecuteTransaction: (args: { intent: TransactionIntent }) => Promise<any>;
};

type ServiceCreator<B = unknown> = {
  serviceId: ServiceId;
  createService: () => {
    serviceId: string;
    serviceBox: B;
  };
  createSigner: (args: {
    signerAccountId: AccountId;
    serviceBox: B;
    client: Client;
  }) => Signer;
};

type StoreContext = {
  serviceCreators: ServiceCreator[];
  client: Client;
  services: Record<ServiceId, Service>;
  signers: Signer[];
};

export type NearState = {
  networkId: string;
  connectedAccountId?: AccountId;
  getContext: () => StoreContext;
  setSigners: (connectedAccountId: AccountId) => void;
  clearSigners: () => void;
  setConnectedAccountId: (connectedAccountId?: AccountId) => void;
};

type CreateNearStoreArgs = {
  networkId: string;
  createClient: () => Client;
  serviceCreators: ServiceCreator[];
  storeName?: string;
};

export const createNearStore = (args: CreateNearStoreArgs) => {
  const {
    storeName = 'react-near-ts',
    networkId,
    createClient,
    serviceCreators,
  } = args;

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
    client: createClient(),
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
          if (state?.connectedAccountId)
            state.setSigners(state.connectedAccountId);
        },
      },
    ),
  );
};

export type NearStore = ReturnType<typeof createNearStore>;
