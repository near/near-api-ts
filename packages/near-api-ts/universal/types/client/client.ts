import type { CreateClientPublicErrorRegistry } from './createClient';
import type {
  SendRequest,
  SendRequestInnerErrorRegistry,
} from './transport/sendRequest';
import type {
  GetAccountInfo,
  GetAccountInfoPublicErrorRegistry,
  SafeGetAccountInfo,
} from './methods/account/getAccountInfo';
import type {
  GetAccountAccessKey,
  GetAccountAccessKeyPublicErrorRegistry,
  SafeGetAccountAccessKey,
} from './methods/account/getAccountAccessKey';
import type {
  SafeSendSignedTransaction,
  SendSignedTransaction,
  SendSignedTransactionPublicErrorRegistry,
} from './methods/transaction/sendSignedTransaction';
import type {
  GetAccountAccessKeys,
  GetAccountAccessKeysPublicErrorRegistry,
  SafeGetAccountAccessKeys,
} from './methods/account/getAccountAccessKeys';
import type {
  GetBlock,
  GetBlockPublicErrorRegistry,
  SafeGetBlock,
} from './methods/block/getBlock';
import { ClientBrand } from '../../src/client/createClient';
import type {
  CallContractReadFunction,
  CallContractReadFunctionPublicErrorRegistry,
  SafeCallContractReadFunction,
} from './methods/contract/callContractReadFunction';
import type { Cache } from './cache/cache';
import type {
  GetRecentBlockHash,
  GetRecentBlockHashPublicErrorRegistry,
  SafeGetRecentBlockHash,
} from './cache/getRecentBlockHash';

export interface ClientInnerErrorRegistry
  extends SendRequestInnerErrorRegistry {}

export interface ClientPublicErrorRegistry
  extends CreateClientPublicErrorRegistry,
    GetAccountInfoPublicErrorRegistry,
    GetAccountAccessKeyPublicErrorRegistry,
    GetAccountAccessKeysPublicErrorRegistry,
    CallContractReadFunctionPublicErrorRegistry,
    GetBlockPublicErrorRegistry,
    GetRecentBlockHashPublicErrorRegistry,
    SendSignedTransactionPublicErrorRegistry {}

export type ClientContext = {
  sendRequest: SendRequest;
  cache: Cache;
};

export type Client = {
  [ClientBrand]: true; // TODO Remove
  // throwable variants
  getAccountInfo: GetAccountInfo;
  getAccountAccessKey: GetAccountAccessKey;
  getAccountAccessKeys: GetAccountAccessKeys;
  callContractReadFunction: CallContractReadFunction;
  getBlock: GetBlock;
  getRecentBlockHash: GetRecentBlockHash;
  sendSignedTransaction: SendSignedTransaction;
  // safe variants
  safeGetAccountInfo: SafeGetAccountInfo;
  safeGetAccountAccessKey: SafeGetAccountAccessKey;
  safeGetAccountAccessKeys: SafeGetAccountAccessKeys;
  safeCallContractReadFunction: SafeCallContractReadFunction;
  safeGetBlock: SafeGetBlock;
  safeGetRecentBlockHash: SafeGetRecentBlockHash;
  safeSendSignedTransaction: SafeSendSignedTransaction;

  // getContractState: GetContractState;
  // getProtocolConfig: GetProtocolConfig;
  // getGasPrice: GetGasPrice;
};
