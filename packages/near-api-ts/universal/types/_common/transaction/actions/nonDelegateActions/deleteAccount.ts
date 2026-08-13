import type { NatError } from '../../../../../src/_common/_common/_common/natError';
import type { AccountId, Result } from '../../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';

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

// ****** NEARCORE ********

export type NearcoreDeleteAccountAction = {
  deleteAccount: {
    beneficiaryId: AccountId;
  };
};
