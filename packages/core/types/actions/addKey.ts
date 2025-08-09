import type { NativePublicKey, PublicKey } from 'nat-types/crypto';
import type {
  AccountId,
  ContractFunctionName,
  NearAmount,
} from 'nat-types/common';

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

// ****** NATIVE ********

type NativeFullAccessPermission = {
  fullAccess: {};
};

type NativeFunctionCallPermission = {
  functionCall: {
    receiverId: AccountId;
    allowance?: bigint;
    methodNames?: ContractFunctionName[];
  };
};

export type NativeAddKeyAction = {
  addKey: {
    publicKey: NativePublicKey;
    accessKey: {
      nonce: bigint;
      permission: NativeFullAccessPermission | NativeFunctionCallPermission;
    };
  };
};
