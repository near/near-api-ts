import { createCircularQueue } from '@common/utils/createCircularQueue';
import { createSendRequest } from './createSendRequest';
import * as factoryRpcMethods from './rpcMethods/rpcMethods';
import type { CircularQueue } from '@common/utils/createCircularQueue';
import type { SendRequest } from './createSendRequest';

type Rpc = {
  url: string;
  headers?: Record<string, string>;
};

export type Network = {
  rpcs: {
    regular: Rpc[];
    archival: Rpc[];
  };
};

export type ClientState = {
  regularRpcQueue: CircularQueue<Rpc>;
  archivalRpcQueue: CircularQueue<Rpc>;
};

export type ClientMethodContext = {
  sendRequest: SendRequest;
};

type createClientArgs = {
  network: Network;
};

type CreateClient = (args: createClientArgs) => {
  getAccount: factoryRpcMethods.GetAccount;
  getAccountBalance: factoryRpcMethods.GetAccountBalance;
  getAccountKey: factoryRpcMethods.GetAccountKey;
  getAccountKeys: factoryRpcMethods.GetAccountKeys;
  getProtocolConfig: factoryRpcMethods.GetProtocolConfig;
  sendSignedTransaction: factoryRpcMethods.SendSignedTransaction;
};

export const createClient: CreateClient = ({ network }) => {
  // TODO Validate network
  const state = {
    regularRpcQueue: createCircularQueue(network.rpcs.regular),
    archivalRpcQueue: createCircularQueue(network.rpcs.archival),
  };

  // TODO get preferred RPC type
  const context = {
    sendRequest: createSendRequest(state),
  };

  return {
    getAccount: factoryRpcMethods.getAccount(context),
    getAccountBalance: factoryRpcMethods.getAccountBalance(context),
    getAccountKey: factoryRpcMethods.getAccountKey(context),
    getAccountKeys: factoryRpcMethods.getAccountKeys(context),
    getProtocolConfig: factoryRpcMethods.getProtocolConfig(context),
    sendSignedTransaction: factoryRpcMethods.sendSignedTransaction(context),
  };
};

// TODO move to types
export type Client = ReturnType<CreateClient>;
