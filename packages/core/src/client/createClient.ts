import { createCircularQueue } from '../utils/createCircularQueue.js';
import { createSendRequest } from './createSendRequest.js';
import * as factoryRpcMethods from './rpcMethods/rpcMethods.js';
import type { CircularQueue } from '../utils/createCircularQueue.js';
import type { SendRequest } from './createSendRequest.js';

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
}

type createClientArgs = {
  network: Network;
};

type CreateClient = (args: createClientArgs) => {
  getAccount: factoryRpcMethods.GetAccount;
  getAccountBalance: factoryRpcMethods.GetAccountBalance;
  getAccountKey: factoryRpcMethods.GetAccountKey;
  getProtocolConfig: factoryRpcMethods.GetProtocolConfig;
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
    getProtocolConfig: factoryRpcMethods.getProtocolConfig(context),
  };
};
