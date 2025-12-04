import type { GetAccountInfo } from 'nat-types/client/methods/account/getAccountInfo';
import type { GetAccountKey } from 'nat-types/client/methods/account/getAccountKey';
import type { GetAccountKeys } from 'nat-types/client/methods/account/getAccountKeys';
import type { GetBlock } from 'nat-types/client/methods/block/getBlock';
import type { GetGasPrice } from 'nat-types/client/methods/protocol/getGasPrice';
import type { GetProtocolConfig } from 'nat-types/client/methods/protocol/getProtocolConfig';
import type { SendSignedTransaction } from 'nat-types/client/methods/transaction/sendSignedTransaction';
import type { GetContractState } from 'nat-types/client/methods/contract/getContractState';
import type { CallContractReadFunction } from 'nat-types/client/methods/contract/callContractReadFunction';
import type { JsonLikeValue } from 'nat-types/_common/common';
import type {
  CreateTransportArgs,
  PartialTransportPolicy,
} from 'nat-types/client/transport';

export type SendRequest = (args: {
  method: string;
  params: JsonLikeValue;
  transportPolicy?: PartialTransportPolicy;
  signal?: AbortSignal;
}) => Promise<unknown>;

export type ClientContext = {
  sendRequest: SendRequest;
};

export type Client = {
  getAccountInfo: GetAccountInfo;
  getAccountKey: GetAccountKey;
  getAccountKeys: GetAccountKeys;
  getContractState: GetContractState;
  callContractReadFunction: CallContractReadFunction;
  getBlock: GetBlock;
  getProtocolConfig: GetProtocolConfig;
  getGasPrice: GetGasPrice;
  sendSignedTransaction: SendSignedTransaction;
};

type CreateClientArgs = {
  transport: CreateTransportArgs; // NextFeature: add cache / add defaults atMomentOf / logger
};

export type CreateClient = (args: CreateClientArgs) => Promise<Client>;
