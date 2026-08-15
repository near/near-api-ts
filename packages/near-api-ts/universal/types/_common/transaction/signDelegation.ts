import type { NatError } from '../../../src/_common/_common/_common/_common/natError';
import type { Result } from '../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../natError';
import type { SafeSignData } from '../signData';
import type { Delegation, SignedDelegation } from './actions/delegate/delegation';

export interface SignDelegationPublicErrorRegistry {
  'SignDelegation.Args.InvalidSchema': InvalidSchemaErrorContext;
  'SignDelegation.SignData.Failed': { cause: unknown };
  'SignDelegation.Internal': InternalErrorContext;
}

export type SignDelegationArgs<SDE = unknown> = {
  signDataProvider: { safeSignData: SafeSignData<SDE> };
  delegation: Delegation;
};

type SignDelegationOutput = SignedDelegation;

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
