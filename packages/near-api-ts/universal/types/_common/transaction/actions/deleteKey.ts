import type { NatError } from '../../../../src/_common/natError';
import type { Result } from '../../common';
import type { NativePublicKey, PublicKey } from '../../crypto';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../natError';

export interface CreateDeleteKeyActionPublicErrorRegistry {
  'CreateAction.DeleteKey.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.DeleteKey.Internal': InternalErrorContext;
}

export type CreateDeleteKeyActionArgs = {
  publicKey: PublicKey;
};

export type DeleteKeyAction = {
  actionType: 'DeleteKey';
  publicKey: PublicKey;
};

type CreateDeleteKeyActionError =
  | NatError<'CreateAction.DeleteKey.Args.InvalidSchema'>
  | NatError<'CreateAction.DeleteKey.Internal'>;

export type SafeCreateDeleteKeyAction = (
  args: CreateDeleteKeyActionArgs,
) => Result<DeleteKeyAction, CreateDeleteKeyActionError>;

export type CreateDeleteKeyAction = (
  args: CreateDeleteKeyActionArgs,
) => DeleteKeyAction;

// ****** NATIVE ********

export type NativeDeleteKeyAction = {
  deleteKey: {
    publicKey: NativePublicKey;
  };
};
