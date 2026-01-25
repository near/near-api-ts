import type {
  CreateClientErrorVariant,
  CreateClientInternalErrorKind,
} from 'nat-types/client/createClient';
import type { SendRequest } from 'nat-types/client/transport/sendRequest';
import type {
  GetAccountInfo,
  GetAccountInfoErrorVariant,
  GetAccountInfoInternalErrorKind,
  SafeGetAccountInfo,
} from 'nat-types/client/methods/account/getAccountInfo';
import type {
  GetAccountAccessKey,
  GetAccountAccessKeyErrorVariant,
  GetAccountAccessKeyInternalErrorKind,
  SafeGetAccountAccessKey,
} from 'nat-types/client/methods/account/getAccountAccessKey';
import type { TransportErrorVariant } from 'nat-types/client/transport/transport';
import type {
  SafeSendSignedTransaction,
  SendSignedTransaction,
  SendSignedTransactionErrorVariant,
  SendSignedTransactionInternalErrorKind,
} from 'nat-types/client/methods/transaction/sendSignedTransaction';
import type {
  GetAccountAccessKeys,
  GetAccountAccessKeysErrorVariant,
  GetAccountAccessKeysInternalErrorKind,
  SafeGetAccountAccessKeys,
} from 'nat-types/client/methods/account/getAccountAccessKeys';
import type {
  GetBlock,
  GetBlockErrorVariant,
  GetBlockInternalErrorKind,
  SafeGetBlock,
} from 'nat-types/client/methods/block/getBlock';
import { ClientBrand } from '../../src/client/createClient';
import type {
  CallContractReadFunction,
  CallContractReadFunctionErrorVariant,
  CallContractReadFunctionInternalErrorKind,
  SafeCallContractReadFunction,
} from 'nat-types/client/methods/contract/callContractReadFunction';
import type {
  Cache,
  GetStoragePricePerByte,
} from 'nat-types/client/cache/cache';

export type ClientErrorVariant =
  | CreateClientErrorVariant
  | TransportErrorVariant
  | GetAccountInfoErrorVariant
  | GetAccountAccessKeyErrorVariant
  | GetAccountAccessKeysErrorVariant
  | CallContractReadFunctionErrorVariant
  | GetBlockErrorVariant
  | SendSignedTransactionErrorVariant;

export type ClientInternalErrorKind =
  | CreateClientInternalErrorKind
  | GetAccountInfoInternalErrorKind
  | GetAccountAccessKeyInternalErrorKind
  | GetAccountAccessKeysInternalErrorKind
  | CallContractReadFunctionInternalErrorKind
  | GetBlockInternalErrorKind
  | SendSignedTransactionInternalErrorKind;

export type ClientContext = {
  sendRequest: SendRequest;
  cache: Cache;
};

export type Client = {
  [ClientBrand]: true;
  // RPC Methods
  // throwable variants
  getAccountInfo: GetAccountInfo;
  getAccountAccessKey: GetAccountAccessKey;
  getAccountAccessKeys: GetAccountAccessKeys;
  callContractReadFunction: CallContractReadFunction;
  getBlock: GetBlock;
  sendSignedTransaction: SendSignedTransaction;
  // safe variants
  safeGetAccountInfo: SafeGetAccountInfo;
  safeGetAccountAccessKey: SafeGetAccountAccessKey;
  safeGetAccountAccessKeys: SafeGetAccountAccessKeys;
  safeCallContractReadFunction: SafeCallContractReadFunction;
  safeGetBlock: SafeGetBlock;
  safeSendSignedTransaction: SafeSendSignedTransaction;

  // getContractState: GetContractState;
  // getProtocolConfig: GetProtocolConfig;
  // getGasPrice: GetGasPrice;
};
