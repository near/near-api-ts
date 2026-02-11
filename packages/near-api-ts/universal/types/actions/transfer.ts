import type { NearTokenArgs } from '../_common/nearToken';
import type {
  InternalErrorContext,
  InvalidSchemaContext,
} from '../natError';
import type { NatError } from '../../src/_common/natError';
import type { Result } from '../_common/common';

export type CreateTransferActionErrorVariant =
  | {
      kind: 'CreateAction.Transfer.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateAction.Transfer.Internal';
      context: InternalErrorContext;
    };

export type CreateTransferActionInternalErrorKind =
  'CreateAction.Transfer.Internal';

export type CreateTransferActionArgs = {
  amount: NearTokenArgs;
};

export type TransferAction = {
  actionType: 'Transfer';
  amount: NearTokenArgs;
};

type CreateTransferActionError =
  | NatError<'CreateAction.Transfer.Args.InvalidSchema'>
  | NatError<'CreateAction.Transfer.Internal'>;

export type SafeCreateTransferAction = (
  args: CreateTransferActionArgs,
) => Result<TransferAction, CreateTransferActionError>;

export type CreateTransferAction = (
  args: CreateTransferActionArgs,
) => TransferAction;

// ****** NATIVE ********

export type NativeTransferAction = {
  transfer: {
    deposit: bigint;
  };
};
