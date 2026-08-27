import type { NatError } from '../../../src/_common/_common/_common/_common/natError';
import type { Base64String, Result } from '../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../natError';
import type { SafeSignData } from '../signData';
import type {
  DelegationBase,
  MultiDelegableActions,
  SignedDelegation,
  SingleDelegableAction,
} from './actions/executeDelegation/delegation';

export interface SignDelegationPublicErrorRegistry {
  'SignDelegation.Args.InvalidSchema': InvalidSchemaErrorContext;
  'SignDelegation.SignData.Failed': { cause: unknown };
  'SignDelegation.Internal': InternalErrorContext;
}

export type SignDelegationArgs<SDE = unknown> = {
  delegation: DelegationBase & (SingleDelegableAction | MultiDelegableActions);
  signDataProvider: { safeSignData: SafeSignData<SDE> };
};

export type SignDelegationOutput = {
  signedDelegation: SignedDelegation;
  signedDelegationBorsh64: Base64String;
};

type SignDelegationError<SDE> =
  | NatError<'SignDelegation.Args.InvalidSchema'>
  | NatError<'SignDelegation.SignData.Failed', { cause: SDE }>
  | NatError<'SignDelegation.Internal'>;

export type SafeSignDelegation = <SDE = unknown>(
  args: SignDelegationArgs<SDE>,
) => Promise<Result<SignDelegationOutput, SignDelegationError<SDE>>>;

export type SignDelegation = <SDE = unknown>(
  args: SignDelegationArgs<SDE>,
) => Promise<SignDelegationOutput>;
