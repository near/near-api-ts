import type { GetAccountInfo } from 'nat-types/client/methods/account/getAccountInfo';
import type { SendRequest } from 'nat-types/client/transport';
import type {
  CreateClientErrorVariant,
  CreateClientUnknownErrorKind,
} from 'nat-types/client/createClient';

export type ClientErrorVariant = CreateClientErrorVariant;

export type ClientUnknownErrorKind = CreateClientUnknownErrorKind;

export type ClientContext = {
  sendRequest: SendRequest;
};

// NextFeature: add cache / add defaults atMomentOf / logger

export type Client = {
  getAccountInfo: GetAccountInfo;
  // getAccountKey: GetAccountKey;
  // getAccountKeys: GetAccountKeys;
  // getContractState: GetContractState;
  // callContractReadFunction: CallContractReadFunction;
  // getBlock: GetBlock;
  // getProtocolConfig: GetProtocolConfig;
  // getGasPrice: GetGasPrice;
  // sendSignedTransaction: SendSignedTransaction;
};
