import type { NatError } from '../../src/_common/natError';
import type { Result } from '../_common/common';
import type { NearTokenArgs } from '../_common/nearToken';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../natError';

export interface CreateTransferActionPublicErrorRegistry {
  'CreateAction.Transfer.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.Transfer.Internal': InternalErrorContext;
}

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
