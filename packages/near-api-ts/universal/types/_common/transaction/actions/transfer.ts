import type { NatError } from '../../../../src/_common/natError';
import type { Result } from '../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../natError';
import type { NearTokenArgs } from '../../nearToken';

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

export type CreateTransferAction = (args: CreateTransferActionArgs) => TransferAction;

// ****** NATIVE ********

export type NativeTransferAction = {
  transfer: {
    deposit: bigint;
  };
};
