import type { NativePublicKey } from 'nat-types/crypto';
import type { AccountId, ContractFunctionName } from 'nat-types/common';
import type { FullAccessKey, FunctionCallKey } from 'nat-types/accountKey';

export type AddKeyAction = {
  type: 'AddKey';
  params: Omit<FullAccessKey, 'nonce'> | Omit<FunctionCallKey, 'nonce'>;
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
