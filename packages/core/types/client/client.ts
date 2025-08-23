import type { CircularQueue } from '@common/utils/createCircularQueue';
import type { GetAccount } from './rpcMethods/account/getAccount';
import type { GetAccountBalance } from './rpcMethods/account/getAccountBalance';
import type { GetAccountKey } from './rpcMethods/accountKeys/getAccountKey';
import type { GetAccountKeys } from './rpcMethods/accountKeys/getAccountKeys';
import type { GetBlock } from './rpcMethods/block/getBlock';
import type { GetGasPrice } from './rpcMethods/protocol/getGasPrice';
import type { GetProtocolConfig } from './rpcMethods/protocol/getProtocolConfig';
import type { SendSignedTransaction } from './rpcMethods/transaction/sendSignedTransaction';

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

export type SendRequest = <Body, Result>(args: {
  body: Body;
  responseTransformer?: any;
}) => Promise<Result>;

export type CreateSendRequest = (clientContext: ClientContext) => SendRequest;

export type ClientContext = {
  regularRpcQueue: CircularQueue<Rpc>;
  archivalRpcQueue: CircularQueue<Rpc>;
  sendRequest: SendRequest;
};

export type Input = {
  network: Network;
};

export type Client = {
  getAccount: GetAccount;
  getAccountBalance: GetAccountBalance;
  getAccountKey: GetAccountKey;
  getAccountKeys: GetAccountKeys;
  getProtocolConfig: GetProtocolConfig;
  getGasPrice: GetGasPrice;
  getBlock: GetBlock;
  sendSignedTransaction: SendSignedTransaction;
};

export type CreateClient = (input: Input) => Client;
