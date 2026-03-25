import type { AccountId, Client } from 'near-api-ts';
import type { StoreApi } from 'zustand';
import type { Service, ServiceCreator, ServiceId, Signer } from './services/_common';
import type { NearConnectorServiceCreator } from './services/nearConnector.ts';

export type StoreContext = {
  serviceCreators: ServiceCreator[];
  client: Client;
  services: Record<ServiceId, Service>;
  signers: Signer[];
};

export type GetContext = () => StoreContext;
export type SetSigners = (connectedAccountId: AccountId) => void;
export type ClearSigners = () => void;
export type SetConnectedAccountId = (connectedAccountId?: AccountId) => void;

export type NearState = {
  networkId: string;
  connectedAccountId?: AccountId;
  getContext: GetContext;
  setSigners: SetSigners;
  clearSigners: ClearSigners;
  setConnectedAccountId: SetConnectedAccountId;
};

export type CreateNearStoreArgs = {
  networkId: string;
  clientCreator: () => Client;
  serviceCreator: NearConnectorServiceCreator;
  storeName?: string;
};

export type NearStore = StoreApi<NearState>;
export type CreateNearStore = (args: CreateNearStoreArgs) => NearStore;
