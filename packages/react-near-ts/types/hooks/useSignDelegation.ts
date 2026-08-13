import type { MutateOptions } from '@tanstack/react-query';
import type { DelegationIntent } from 'near-api-ts';
import type { Prettify } from '../_common/common.ts';
import type { BaseUseMutationResult, MutationOptions } from './_common/tanstackMutation.ts';

type SignDelegationVariables = {
  intent: DelegationIntent;
};

// TODO replace with SignedDelegation in the future

type SignDelegationOutput = { signedDelegationBorsh64: string };
type SignDelegationError = Error;

type UseSignDelegationArgs<OnMutateResult> = {
  mutation?: MutationOptions<
    SignDelegationOutput,
    SignDelegationError,
    SignDelegationVariables,
    OnMutateResult
  >;
};

type SignDelegationArgs<OnMutateResult> = Prettify<
  SignDelegationVariables & {
    mutate?: MutateOptions<
      SignDelegationOutput,
      SignDelegationError,
      SignDelegationVariables,
      OnMutateResult
    >;
  }
>;

type UseSignDelegationOutput<OnMutateResult> = {
  signDelegation: (args: SignDelegationArgs<OnMutateResult>) => void;
  signDelegationAsync: (args: SignDelegationArgs<OnMutateResult>) => Promise<SignDelegationOutput>;
} & BaseUseMutationResult<
  SignDelegationOutput,
  SignDelegationError,
  SignDelegationVariables,
  OnMutateResult
>;

export type UseSignDelegation = <OnMutateResult = unknown>(
  args?: UseSignDelegationArgs<OnMutateResult>,
) => UseSignDelegationOutput<OnMutateResult>;
