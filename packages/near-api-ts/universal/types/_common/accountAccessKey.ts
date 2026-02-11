import type { PublicKey } from './crypto';
import type {
  AccountId,
  ContractFunctionName,
  Nonce,
} from './common';
import type { NearToken } from './nearToken';

export type FullAccessKey = {
  accessType: 'FullAccess';
  publicKey: PublicKey;
  nonce: Nonce;
};

export type FunctionCallKey = {
  accessType: 'FunctionCall';
  publicKey: PublicKey;
  nonce: Nonce;
  contractAccountId: AccountId;
  gasBudget?: NearToken;
  allowedFunctions?: ContractFunctionName[];
};

export type AccountAccessKey = FullAccessKey | FunctionCallKey;
