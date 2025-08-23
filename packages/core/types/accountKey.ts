import type { PublicKey } from 'nat-types/crypto';
import type {
  AccountId,
  ContractFunctionName,
  Nonce,
  YoctoNearAmount,
} from 'nat-types/common';

export type FullAccessKey = {
  type: 'FullAccess';
  publicKey: PublicKey;
  nonce: Nonce;
};

export type FunctionCallKey = {
  type: 'FunctionCall';
  publicKey: PublicKey;
  nonce: Nonce;
  contractAccountId: AccountId;
  gasBudget?: YoctoNearAmount;
  allowedFunctions?: ContractFunctionName[];
};

export type AccountKey = FullAccessKey | FunctionCallKey;
