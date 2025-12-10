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

export type ClientErrorVariant =
  | CreateClientErrorVariant
  | TransportErrorVariant
  | GetAccountInfoErrorVariant
  | GetAccountAccessKeyErrorVariant;

export type ClientUnknownErrorKind =
  | CreateClientUnknownErrorKind
  | GetAccountInfoUnknownErrorKind
  | GetAccountAccessKeyUnknownErrorKind;

export type ClientContext = {
  sendRequest: SendRequest;
};

// NextFeature: add cache / add defaults atMomentOf / logger

export type Client = {
  safeGetAccountInfo: SafeGetAccountInfo;
  getAccountInfo: GetAccountInfo;
  safeGetAccountAccessKey: SafeGetAccountAccessKey;
  getAccountAccessKey: GetAccountAccessKey;

  // getAccountKeys: GetAccountKeys;
  // getContractState: GetContractState;
  // callContractReadFunction: CallContractReadFunction;
  // getBlock: GetBlock;
  // getProtocolConfig: GetProtocolConfig;
  // getGasPrice: GetGasPrice;
  // sendSignedTransaction: SendSignedTransaction;
};
