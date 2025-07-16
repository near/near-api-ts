import { createCircularQueue } from '../utils/createCircularQueue.js';
import { createSendRequest } from './createSendRequest.js';
import { factoryRpcMethods } from './rpcMethods/rpcMethods.js';
import type { CircularQueue } from '../utils/createCircularQueue.js';
import type { FactoryRpcMethods, RpcMethods } from './rpcMethods/rpcMethods.js';
import type { SendRequest } from './createSendRequest.js';

type Rpc = {
  url: string;
  headers?: Record<string, string>;
};

type Network = {
  rpcs: {
    regular: Rpc[];
    archival: Rpc[];
  };
};

export type CreateClientContext = {
  regularRpcQueue: CircularQueue<Rpc>;
  archivalRpcQueue: CircularQueue<Rpc>;
};

type createClientArgs = {
  network: Network;
};

type CreateClient = (args: createClientArgs) => RpcMethods & {};

const injectSendRequest = (
  factoryRpcMethods: FactoryRpcMethods,
  sendRequest: SendRequest,
) =>
  Object.fromEntries(
    Object.entries(factoryRpcMethods).map(([k, v]) => [k, v(sendRequest)]),
  ) as RpcMethods;

export const createClient: CreateClient = ({ network }) => {
  // TODO Validate network
  const context = {
    regularRpcQueue: createCircularQueue(network.rpcs.regular),
    archivalRpcQueue: createCircularQueue(network.rpcs.archival),
  };

  // TODO get preferred RPC type
  const sendRequest = createSendRequest({ context });
  return injectSendRequest(factoryRpcMethods, sendRequest);
};
