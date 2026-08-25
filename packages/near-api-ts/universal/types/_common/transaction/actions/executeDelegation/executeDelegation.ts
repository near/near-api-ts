import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { Base64String, Result } from '../../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';
import type { NearcoreSignedDelegation, SignedDelegation } from './delegation';

export interface CreateExecuteDelegationActionPublicErrorRegistry {
  'CreateAction.ExecuteDelegation.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.ExecuteDelegation.Deserialize.Failed': { cause: unknown };
  'CreateAction.ExecuteDelegation.Internal': InternalErrorContext;
}

export type CreateExecuteDelegationActionArgs = {
  signedDelegationBorsh64: Base64String;
};

/**
 * The transaction action a relayer wraps a signed delegation in. It carries the
 * signed delegation itself, not its borsh bytes - the action is serialized as a
 * part of the relayer's own transaction.
 */
export type ExecuteDelegationAction = {
  actionType: 'ExecuteDelegation';
  signedDelegation: SignedDelegation;
};

type CreateExecuteDelegationActionError =
  | NatError<'CreateAction.ExecuteDelegation.Args.InvalidSchema'>
  | NatError<'CreateAction.ExecuteDelegation.Deserialize.Failed'>
  | NatError<'CreateAction.ExecuteDelegation.Internal'>;

export type SafeCreateExecuteDelegationAction = (
  args: CreateExecuteDelegationActionArgs,
) => Result<ExecuteDelegationAction, CreateExecuteDelegationActionError>;

export type CreateExecuteDelegationAction = (
  args: CreateExecuteDelegationActionArgs,
) => ExecuteDelegationAction;

// ****** NEARCORE ********

export type NearcoreExecuteDelegationAction = {
  executeDelegation: NearcoreSignedDelegation;
};
