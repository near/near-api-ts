import type { Client, AccountId } from 'near-api-ts';
import type { Service, ServiceCreator, Signer, ServiceId } from './services/_common';
import type { StoreApi } from 'zustand';
import type { NearConnectServiceCreator } from './services/nearConnect.ts';

export type StoreContext = {
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

export type CreateNearStoreArgs = {
  networkId: string;
  clientCreator: () => Client;
  serviceCreator: NearConnectServiceCreator;
  storeName?: string;
};

export type NearStore = StoreApi<NearState>;
export type CreateNearStore = (args: CreateNearStoreArgs) => NearStore;
