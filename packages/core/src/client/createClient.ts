import { createGetAccountState } from './methods/account/getAccountState';
import { createGetAccountKey } from './methods/account/getAccountKey';
import { createGetAccountKeys } from './methods/account/getAccountKeys';
import { createGetContractState } from './methods/contract/getContractState';
import { createCallContractReadFunction } from './methods/contract/callContractReadFunction';
import { createGetBlock } from './methods/block/getBlock';
import { createGetGasPrice } from './methods/protocol/getGasPrice';
import { createGetProtocolConfig } from './methods/protocol/getProtocolConfig';
import { createSendSignedTransaction } from './methods/transaction/sendSignedTransaction';
import type { CreateClient } from 'nat-types/client/client';

// TODO add state for protocol config / blockHash
export const createClient: CreateClient = ({ transport }) => {
  const context = {
    sendRequest: transport.sendRequest,
  };

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
