import type { NativePublicKey, PublicKey } from 'nat-types/crypto';
import type {
  AccountId,
  ContractFunctionName,
  NearOption,
} from 'nat-types/common';

export type CreateAddFullAccessKeyActionArgs = {
  publicKey: PublicKey;
};

export type CreateAddFunctionCallKeyActionArgs = {
  publicKey: PublicKey;
  contractAccountId: AccountId;
  gasBudget?: NearOption;
  allowedFunctions?: ContractFunctionName[];
};

export type AddFullAccessKeyAction = {
  actionType: 'AddKey';
  accessType: 'FullAccess';
} & CreateAddFullAccessKeyActionArgs;

export type AddFunctionCallKeyAction = {
  actionType: 'AddKey';
  accessType: 'FunctionCall';
} & CreateAddFunctionCallKeyActionArgs;

export type AddKeyAction = AddFullAccessKeyAction | AddFunctionCallKeyAction;

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
