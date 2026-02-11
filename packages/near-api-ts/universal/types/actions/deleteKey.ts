import type { PublicKey, NativePublicKey } from '../_common/crypto';
import type {
  InternalErrorContext,
  InvalidSchemaContext,
} from '../natError';
import type { NatError } from '../../src/_common/natError';
import type { Result } from '../_common/common';

export type CreateDeleteKeyActionErrorVariant =
  | {
      kind: 'CreateAction.DeleteKey.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateAction.DeleteKey.Internal';
      context: InternalErrorContext;
    };

export type CreateDeleteKeyActionInternalErrorKind =
  'CreateAction.DeleteKey.Internal';

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
