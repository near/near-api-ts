import type { Cache } from './cache/cache';
import type {
  GetRecentBlockHash,
  GetRecentBlockHashPublicErrorRegistry,
  SafeGetRecentBlockHash,
} from './cache/getRecentBlockHash';
import type { CreateClientPublicErrorRegistry } from './createClient';
import type {
  GetAccessKey,
  GetAccessKeyPublicErrorRegistry,
  SafeGetAccessKey,
} from './methods/account/getAccessKey';
import type {
  GetAccessKeys,
  GetAccessKeysPublicErrorRegistry,
  SafeGetAccessKeys,
} from './methods/account/getAccessKeys';
import type {
  GetAccountInfo,
  GetAccountInfoPublicErrorRegistry,
  SafeGetAccountInfo,
} from './methods/account/getAccountInfo';
import type { GetBlock, GetBlockPublicErrorRegistry, SafeGetBlock } from './methods/block/getBlock';
import type {
  CallContractReadFunction,
  CallContractReadFunctionPublicErrorRegistry,
  SafeCallContractReadFunction,
} from './methods/contract/callContractReadFunction';
import type { TransactionDetailsInnerErrorRegistry } from './methods/transaction/_common/innerErrorRegistry';
import type {
  GetTransactionResult,
  GetTransactionResultPublicErrorRegistry,
  SafeGetTransactionResult,
} from './methods/transaction/getTransactionResult';
import type { SendSignedTransactionPublicErrorRegistry } from './methods/transaction/sendSignedTransaction/error';
import type {
  SafeSendSignedTransaction,
  SendSignedTransaction,
} from './methods/transaction/sendSignedTransaction/sendSignedTransaction';
import type { SendRequest, SendRequestInnerErrorRegistry } from './transport/sendRequest';

export interface ClientInnerErrorRegistry
  extends SendRequestInnerErrorRegistry,
    TransactionDetailsInnerErrorRegistry {}

export interface ClientPublicErrorRegistry
  extends CreateClientPublicErrorRegistry,
    GetAccountInfoPublicErrorRegistry,
    GetAccessKeyPublicErrorRegistry,
    GetAccessKeysPublicErrorRegistry,
    CallContractReadFunctionPublicErrorRegistry,
    GetBlockPublicErrorRegistry,
    GetRecentBlockHashPublicErrorRegistry,
    GetTransactionResultPublicErrorRegistry,
    SendSignedTransactionPublicErrorRegistry {}

export type ClientContext = {
  sendRequest: SendRequest;
  cache: Cache;
};

export type Client = {
  // throwing variants
  getAccountInfo: GetAccountInfo;
  getAccessKey: GetAccessKey;
  getAccessKeys: GetAccessKeys;
  callContractReadFunction: CallContractReadFunction;
  getBlock: GetBlock;
  getRecentBlockHash: GetRecentBlockHash;
  getTransactionResult: GetTransactionResult;
  sendSignedTransaction: SendSignedTransaction;
  // safe variants
  safeGetAccountInfo: SafeGetAccountInfo;
  safeGetAccessKey: SafeGetAccessKey;
  safeGetAccessKeys: SafeGetAccessKeys;
  safeCallContractReadFunction: SafeCallContractReadFunction;
  safeGetBlock: SafeGetBlock;
  safeGetRecentBlockHash: SafeGetRecentBlockHash;
  safeGetTransactionResult: SafeGetTransactionResult;
  safeSendSignedTransaction: SafeSendSignedTransaction;
};
