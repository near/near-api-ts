import type { AccountId, Result } from '../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../natError';
import type { NatError } from '../../src/_common/natError';

export interface CreateDeleteActionPublicErrorRegistry {
  'CreateAction.DeleteAccount.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.DeleteAccount.Internal': InternalErrorContext;
}

export type CreateDeleteAccountActionArgs = {
  beneficiaryAccountId: AccountId;
};

export type DeleteAccountAction = {
  actionType: 'DeleteAccount';
  beneficiaryAccountId: AccountId;
};

type CreateDeleteAccountActionError =
  | NatError<'CreateAction.DeleteAccount.Args.InvalidSchema'>
  | NatError<'CreateAction.DeleteAccount.Internal'>;

export type SafeCreateDeleteAccountAction = (
  args: CreateDeleteAccountActionArgs,
) => Result<DeleteAccountAction, CreateDeleteAccountActionError>;

export type CreateDeleteAccountAction = (
  args: CreateDeleteAccountActionArgs,
) => DeleteAccountAction;

// ****** NATIVE ********

export type NativeDeleteAccountAction = {
  deleteAccount: {
    beneficiaryId: AccountId;
  };
};
