import { createCircularQueue } from '@common/utils/createCircularQueue';
import { createSendRequest } from './createSendRequest';
import { createGetAccount } from './rpcMethods/account/getAccount';
import { createGetAccountBalance } from './rpcMethods/account/getAccountBalance';
import { createGetAccountKey } from './rpcMethods/accountKeys/getAccountKey';
import { createGetAccountKeys } from './rpcMethods/accountKeys/getAccountKeys';
import { createGetBlock } from './rpcMethods/block/getBlock';
import { createGetGasPrice } from './rpcMethods/protocol/getGasPrice';
import { createGetProtocolConfig } from './rpcMethods/protocol/getProtocolConfig';
import { createSendSignedTransaction } from './rpcMethods/transaction/sendSignedTransaction';
import type { CreateClient, ClientContext } from 'nat-types/client/client';

// TODO Validate network,  get preferred RPC type
export const createClient: CreateClient = ({ network }) => {
  const context = {
    regularRpcQueue: createCircularQueue(network.rpcs.regular),
    archivalRpcQueue: createCircularQueue(network.rpcs.archival),
  } as ClientContext;

  context.sendRequest = createSendRequest(context);

  return {
    getAccount: createGetAccount(context),
    getAccountBalance: createGetAccountBalance(context),
    getAccountKey: createGetAccountKey(context),
    getAccountKeys: createGetAccountKeys(context),
    getBlock: createGetBlock(context),
    getGasPrice: createGetGasPrice(context),
    getProtocolConfig: createGetProtocolConfig(context),
    sendSignedTransaction: createSendSignedTransaction(context),
  };
};
