import type { PublicKey } from 'nat-types/crypto';
import type { AccountId, ContractFunctionName, NearAmount } from 'nat-types/common';

type FullAccessKeyParams = {
  publicKey: PublicKey;
  permission: 'FullAccess';
};

type FunctionCallKeyParams = {
  publicKey: PublicKey;
  permission: 'FunctionCall';
  restrictions: {
    contractAccountId: AccountId;
    gasBudget?: NearAmount;
    allowedFunctions?: ContractFunctionName[];
  };
};

export type AddKeyAction = {
  type: 'AddKey';
  params: FullAccessKeyParams | FunctionCallKeyParams;
};

export type NativeAddKeyAction = {}
