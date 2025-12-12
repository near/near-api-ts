import type {
  CreateClientErrorVariant,
  CreateClientUnknownErrorKind,
} from 'nat-types/client/createClient';
import type { SendRequest } from 'nat-types/client/transport/sendRequest';
import type {
  GetAccountInfo,
  GetAccountInfoErrorVariant,
  GetAccountInfoUnknownErrorKind,
  SafeGetAccountInfo,
} from 'nat-types/client/methods/account/getAccountInfo';
import type {
  GetAccountAccessKey,
  GetAccountAccessKeyErrorVariant,
  GetAccountAccessKeyUnknownErrorKind,
  SafeGetAccountAccessKey,
} from 'nat-types/client/methods/account/getAccountAccessKey';
import type { TransportErrorVariant } from 'nat-types/client/transport/transport';
import type {
  SafeSendSignedTransaction,
  SendSignedTransaction,
  SendSignedTransactionErrorVariant,
  SendSignedTransactionUnknownErrorKind,
} from 'nat-types/client/methods/transaction/sendSignedTransaction';
import type {
  GetAccountAccessKeys,
  GetAccountAccessKeysErrorVariant,
  GetAccountAccessKeysUnknownErrorKind, SafeGetAccountAccessKeys,
} from 'nat-types/client/methods/account/getAccountAccessKeys';

export type ClientErrorVariant =
  | CreateClientErrorVariant
  | TransportErrorVariant
  | GetAccountInfoErrorVariant
  | GetAccountAccessKeyErrorVariant
  | GetAccountAccessKeysErrorVariant
  | SendSignedTransactionErrorVariant;

export type ClientUnknownErrorKind =
  | CreateClientUnknownErrorKind
  | GetAccountInfoUnknownErrorKind
  | GetAccountAccessKeyUnknownErrorKind
  | GetAccountAccessKeysUnknownErrorKind
  | SendSignedTransactionUnknownErrorKind;

export type ClientContext = {
  sendRequest: SendRequest;
};

// NextFeature: add cache / add defaults atMomentOf / logger

export type Client = {
  // throwable variants
  getAccountInfo: GetAccountInfo;
  getAccountAccessKey: GetAccountAccessKey;
  getAccountAccessKeys: GetAccountAccessKeys;
  sendSignedTransaction: SendSignedTransaction;
  // safe variants
  safeGetAccountInfo: SafeGetAccountInfo;
  safeGetAccountAccessKey: SafeGetAccountAccessKey;
  safeGetAccountAccessKeys: SafeGetAccountAccessKeys;
  safeSendSignedTransaction: SafeSendSignedTransaction;

  // getContractState: GetContractState;
  // callContractReadFunction: CallContractReadFunction;
  // getBlock: GetBlock;
  // getProtocolConfig: GetProtocolConfig;
  // getGasPrice: GetGasPrice;
};
