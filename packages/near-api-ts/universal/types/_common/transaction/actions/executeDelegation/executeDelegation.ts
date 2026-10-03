import type { NatError } from '../../../../../src/_common/_common/_common/_common/natError';
import type { Base64String, Result } from '../../../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../natError';
import type {
  NearcoreSignedDelegationV1,
  NearcoreSignedDelegationV2,
  SignedDelegation,
} from './delegation';

export interface CreateExecuteDelegationActionPublicErrorRegistry {
  'CreateAction.ExecuteDelegation.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateAction.ExecuteDelegation.SignedDelegation.Deserialize.Failed': { cause: unknown };
  'CreateAction.ExecuteDelegation.SignedDelegation.InvalidSchema': InvalidSchemaErrorContext;
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
  | NatError<'CreateAction.ExecuteDelegation.SignedDelegation.Deserialize.Failed'>
  | NatError<'CreateAction.ExecuteDelegation.SignedDelegation.InvalidSchema'>
  | NatError<'CreateAction.ExecuteDelegation.Internal'>;

export type SafeCreateExecuteDelegationAction = (
  args: CreateExecuteDelegationActionArgs,
) => Result<ExecuteDelegationAction, CreateExecuteDelegationActionError>;

export type CreateExecuteDelegationAction = (
  args: CreateExecuteDelegationActionArgs,
) => ExecuteDelegationAction;

// ****** NEARCORE ********

// Nearcore keeps the two delegation formats as two actions: `Delegate` (index 8) and
// `DelegateV2` (index 14).
export type NearcoreExecuteDelegationAction =
  | { delegate: NearcoreSignedDelegationV1 }
  | { delegateV2: NearcoreSignedDelegationV2 };
