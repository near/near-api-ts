import { createCircularQueue } from '@common/utils/createCircularQueue';
import { createSendRequest } from './createSendRequest';
import { createGetAccountState } from './account/getAccountState';
import { createGetAccountBalance } from './account/getAccountBalance';
import { createGetAccountKey } from './accountKeys/getAccountKey';
import { createGetAccountKeys } from './accountKeys/getAccountKeys';
import { createGetBlock } from './block/getBlock';
import { createGetGasPrice } from './protocol/getGasPrice';
import { createGetProtocolConfig } from './protocol/getProtocolConfig';
import { createSendSignedTransaction } from './transaction/sendSignedTransaction';
import type { CreateClient, ClientContext } from 'nat-types/client/client';

// TODO Validate network,  get preferred RPC type
export const createClient: CreateClient = ({ network }) => {
  const context = {
    regularRpcQueue: createCircularQueue(network.rpcs.regular),
    archivalRpcQueue: createCircularQueue(network.rpcs.archival),
  } as ClientContext;

  context.sendRequest = createSendRequest(context);

  return {
    getAccountState: createGetAccountState(context),
    getAccountBalance: createGetAccountBalance(context),
    getAccountKey: createGetAccountKey(context),
    getAccountKeys: createGetAccountKeys(context),
    getBlock: createGetBlock(context),
    getGasPrice: createGetGasPrice(context),
    getProtocolConfig: createGetProtocolConfig(context),
    sendSignedTransaction: createSendSignedTransaction(context),
  };
};
