import type { NatError } from '../../../../../src/_common/_common/_common/natError';
import type { Result } from '../../../common';
import type { NearcorePublicKey, PublicKey } from '../../../crypto';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';

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

export type CreateDeleteKeyAction = (args: CreateDeleteKeyActionArgs) => DeleteKeyAction;

// ****** NEARCORE ********

export type NearcoreDeleteKeyAction = {
  deleteKey: {
    publicKey: NearcorePublicKey;
  };
};
