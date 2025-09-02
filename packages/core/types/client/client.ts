import type { CircularQueue } from '@common/utils/createCircularQueue';
import type { GetAccountState } from 'nat-types/client/account/getAccountState';
import type { GetAccountKey } from 'nat-types/client/account/getAccountKey';
import type { GetAccountKeys } from 'nat-types/client/account/getAccountKeys';
import type { GetBlock } from 'nat-types/client/block/getBlock';
import type { GetGasPrice } from 'nat-types/client/protocol/getGasPrice';
import type { GetProtocolConfig } from 'nat-types/client/protocol/getProtocolConfig';
import type { SendSignedTransaction } from 'nat-types/client/transaction/sendSignedTransaction';

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
  getAccountState: GetAccountState;
  getAccountKey: GetAccountKey;
  getAccountKeys: GetAccountKeys;
  getProtocolConfig: GetProtocolConfig;
  getGasPrice: GetGasPrice;
  getBlock: GetBlock;
  sendSignedTransaction: SendSignedTransaction;
};

export type CreateClient = (input: Input) => Client;
