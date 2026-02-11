import type { AccountId, Result } from '../_common/common';
import type {
  InternalErrorContext,
  InvalidSchemaContext,
} from '../natError';
import type { NatError } from '../../src/_common/natError';

export type CreateDeleteAccountActionErrorVariant =
  | {
      kind: 'CreateAction.DeleteAccount.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateAction.DeleteAccount.Internal';
      context: InternalErrorContext;
    };

export type CreateDeleteAccountActionInternalErrorKind =
  'CreateAction.DeleteAccount.Internal';

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
