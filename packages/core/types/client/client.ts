import type { GetAccountState } from 'nat-types/client/methods/account/getAccountState';
import type { GetAccountKey } from 'nat-types/client/methods/account/getAccountKey';
import type { GetAccountKeys } from 'nat-types/client/methods/account/getAccountKeys';
import type { GetBlock } from 'nat-types/client/methods/block/getBlock';
import type { GetGasPrice } from 'nat-types/client/methods/protocol/getGasPrice';
import type { GetProtocolConfig } from 'nat-types/client/methods/protocol/getProtocolConfig';
import type { SendSignedTransaction } from 'nat-types/client/methods/transaction/sendSignedTransaction';
import type { GetContractState } from 'nat-types/client/methods/contract/getContractState';
import type { CallContractReadFunction } from 'nat-types/client/methods/contract/callContractReadFunction';
import type { JsonLikeValue } from 'nat-types/common';
import type { CreateTransportArgs } from 'nat-types/client/transport';

export type ClientContext = {
  sendRequest: SendRequest;
};

export type SendRequest = (args: {
  method: string;
  params: JsonLikeValue;
}) => Promise<unknown>;

type CreateClientArgs = {
  transport: CreateTransportArgs;
  // TODO add cache
  // TODO add defaults atMomentOf
};

export type Client = {
  getAccountState: GetAccountState;
  getAccountKey: GetAccountKey;
  getAccountKeys: GetAccountKeys;
  getContractState: GetContractState;
  callContractReadFunction: CallContractReadFunction;
  getBlock: GetBlock;
  getProtocolConfig: GetProtocolConfig;
  getGasPrice: GetGasPrice;
  sendSignedTransaction: SendSignedTransaction;
};

export type CreateClient = (args: CreateClientArgs) => Promise<Client>;
