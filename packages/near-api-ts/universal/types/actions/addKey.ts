import type { NativePublicKey, PublicKey } from '../_common/crypto';
import type {
  AccountId,
  ContractFunctionName,
  Result,
} from '../_common/common';
import type { NearTokenArgs } from '../_common/nearToken';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../natError';
import type { NatError } from '../../src/_common/natError';

export interface CreateAddKeyActionPublicErrorRegistry {
  'CreateAction.AddFullAccessKey.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.AddFullAccessKey.Internal': InternalErrorContext;
  'CreateAction.AddFunctionCallKey.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.AddFunctionCallKey.Internal': InternalErrorContext;
}

// AddFullAccessKey

export type CreateAddFullAccessKeyActionArgs = {
  publicKey: PublicKey;
};

export type AddFullAccessKeyAction = {
  actionType: 'AddKey';
  accessType: 'FullAccess';
  publicKey: PublicKey;
};

type CreateAddFullAccessKeyActionError =
  | NatError<'CreateAction.AddFullAccessKey.Args.InvalidSchema'>
  | NatError<'CreateAction.AddFullAccessKey.Internal'>;

export type SafeCreateAddFullAccessKeyAction = (
  args: CreateAddFullAccessKeyActionArgs,
) => Result<AddFullAccessKeyAction, CreateAddFullAccessKeyActionError>;

export type CreateAddFullAccessKeyAction = (
  args: CreateAddFullAccessKeyActionArgs,
) => AddFullAccessKeyAction;

// AddFunctionCallKey

export type CreateAddFunctionCallKeyActionArgs = {
  publicKey: PublicKey;
  contractAccountId: AccountId;
  gasBudget?: NearTokenArgs;
  allowedFunctions?: ContractFunctionName[];
};

export type AddFunctionCallKeyAction = {
  actionType: 'AddKey';
  accessType: 'FunctionCall';
  publicKey: PublicKey;
  contractAccountId: AccountId;
  gasBudget?: NearTokenArgs;
  allowedFunctions?: ContractFunctionName[]; // TODO force user to pass at least 1 name
};

type CreateAddFunctionCallKeyActionError =
  | NatError<'CreateAction.AddFunctionCallKey.Args.InvalidSchema'>
  | NatError<'CreateAction.AddFunctionCallKey.Internal'>;

export type SafeCreateAddFunctionCallKeyAction = (
  args: CreateAddFunctionCallKeyActionArgs,
) => Result<AddFunctionCallKeyAction, CreateAddFunctionCallKeyActionError>;

export type CreateAddFunctionCallKeyAction = (
  args: CreateAddFunctionCallKeyActionArgs,
) => AddFunctionCallKeyAction;

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
