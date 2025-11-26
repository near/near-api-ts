import type { PublicKey } from 'nat-types/_common/crypto';
import type {
  AccountId,
  ContractFunctionName,
  Nonce,

} from 'nat-types/_common/common';
import type {NearToken} from 'nat-types/_common/nearToken';

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
