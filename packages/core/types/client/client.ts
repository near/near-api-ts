import type {
  GetAccountInfo,
  GetAccountInfoErrorVariant,
  GetAccountInfoUnknownErrorKind,
  SafeGetAccountInfo,
} from 'nat-types/client/methods/account/getAccountInfo';
import type {
  CreateClientErrorVariant,
  CreateClientUnknownErrorKind,
} from 'nat-types/client/createClient';
import type { SendRequest } from 'nat-types/client/transport/sendRequest';
import type { GetAccountKey } from 'nat-types/client/methods/account/getAccountKey';
import type { SendSignedTransaction } from 'nat-types/client/methods/transaction/sendSignedTransaction';
import type { TransportErrorVariant } from 'nat-types/client/transport/transport';

export type ClientErrorVariant =
  | CreateClientErrorVariant
  | TransportErrorVariant
  | GetAccountInfoErrorVariant;

export type ClientUnknownErrorKind =
  | CreateClientUnknownErrorKind
  | GetAccountInfoUnknownErrorKind;

export type ClientContext = {
  sendRequest: SendRequest;
};

// NextFeature: add cache / add defaults atMomentOf / logger

export type Client = {
  getAccountInfo: GetAccountInfo;
  safeGetAccountInfo: SafeGetAccountInfo;

  // getAccountKey: GetAccountKey;
  // getAccountKeys: GetAccountKeys;
  // getContractState: GetContractState;
  // callContractReadFunction: CallContractReadFunction;
  // getBlock: GetBlock;
  // getProtocolConfig: GetProtocolConfig;
  // getGasPrice: GetGasPrice;
  // sendSignedTransaction: SendSignedTransaction;
};
