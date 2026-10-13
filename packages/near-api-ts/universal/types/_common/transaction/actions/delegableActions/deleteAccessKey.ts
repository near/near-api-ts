import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { Result } from '../../../common';
import type { NearcorePublicKey, PublicKey } from '../../../crypto';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';

export interface CreateDeleteAccessKeyActionPublicErrorRegistry {
  'CreateAction.DeleteAccessKey.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.DeleteAccessKey.Internal': InternalErrorContext;
}

export type CreateDeleteAccessKeyActionArgs = {
  publicKey: PublicKey;
};

export type DeleteAccessKeyAction = {
  actionType: 'DeleteAccessKey';
  publicKey: PublicKey;
};

type CreateDeleteAccessKeyActionError =
  | NatError<'CreateAction.DeleteAccessKey.Args.InvalidSchema'>
  | NatError<'CreateAction.DeleteAccessKey.Internal'>;

export type SafeCreateDeleteAccessKeyAction = (
  args: CreateDeleteAccessKeyActionArgs,
) => Result<DeleteAccessKeyAction, CreateDeleteAccessKeyActionError>;

export type CreateDeleteAccessKeyAction = (
  args: CreateDeleteAccessKeyActionArgs,
) => DeleteAccessKeyAction;

// ****** NEARCORE ********

export type NearcoreDeleteAccessKeyAction = {
  deleteKey: {
    publicKey: NearcorePublicKey;
  };
};
