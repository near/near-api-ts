import type { PublicKey } from 'nat-types/crypto';
import type {
  AccountId,
  ContractFunctionName,
  Nonce,
  NearToken,
} from 'nat-types/common';

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

export type AccountKey = FullAccessKey | FunctionCallKey;
