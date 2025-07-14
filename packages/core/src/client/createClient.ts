import { createCircularQueue } from '../utils/createCircularQueue.js';

type Rpc = {
  url: string;
  headers?: {
    [key: string]: string;
  };
};

type Network = {
  rpcs: {
    regular: Rpc[];
    archival: Rpc[];
  };
};

type createClientArgs = {
  network: Network;
};

export const createClient = ({ network }: createClientArgs) => {
  // create 2 linked lists for queue (reg + arch)
  const state = {
    regularRpcQueue: createCircularQueue(network.rpcs.regular),
  };

  return {
    getAccount: async () => {
      console.log(state.regularRpcQueue.next());
    },
    getAccessKey: async () => {
      console.log(state.regularRpcQueue.next());
    },
  };
};
