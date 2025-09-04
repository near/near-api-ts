import { createSendRequest } from './createSendRequest';
import { createGetAccountState } from './account/getAccountState';
import { createGetAccountKey } from './account/getAccountKey';
import { createGetAccountKeys } from './account/getAccountKeys';
import { createGetContractState } from './contract/getContractState';
import { createCallContractReadFunction } from './contract/callContractReadFunction';
import { createGetBlock } from './block/getBlock';
import { createGetGasPrice } from './protocol/getGasPrice';
import { createGetProtocolConfig } from './protocol/getProtocolConfig';
import { createSendSignedTransaction } from './transaction/sendSignedTransaction';
import { createCircularQueue } from '@common/utils/createCircularQueue';
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
    getAccountKey: createGetAccountKey(context),
    getAccountKeys: createGetAccountKeys(context),
    getContractState: createGetContractState(context),
    callContractReadFunction: createCallContractReadFunction(context),
    getBlock: createGetBlock(context),
    getGasPrice: createGetGasPrice(context),
    getProtocolConfig: createGetProtocolConfig(context),
    sendSignedTransaction: createSendSignedTransaction(context),
  };
};
