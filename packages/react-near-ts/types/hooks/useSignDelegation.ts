import type { MutateOptions } from '@tanstack/react-query';
import type { DelegationIntent } from 'near-api-ts';
import type { Prettify } from '../_common/common.ts';
import type { BaseUseMutationResult, MutationOptions } from './_common/tanstackMutation.ts';

type SignDelegationVariables = {
  intent: DelegationIntent;
};

// TODO replace with SignedDelegation in the future

type SingDelegationOutput = { signedDelegationBorsh64: string };
type SingDelegationError = Error;

type UseSignDelegationArgs<OnMutateResult> = {
  mutation?: MutationOptions<
    SingDelegationOutput,
    SingDelegationError,
    SignDelegationVariables,
    OnMutateResult
  >;
};

type SignDelegationArgs<OnMutateResult> = Prettify<
  SignDelegationVariables & {
    mutate?: MutateOptions<
      SingDelegationOutput,
      SingDelegationError,
      SignDelegationVariables,
      OnMutateResult
    >;
  }
>;

type UseSignDelegationOutput<OnMutateResult> = {
  signDelegation: (args: SignDelegationArgs<OnMutateResult>) => void;
  signDelegationAsync: (args: SignDelegationArgs<OnMutateResult>) => Promise<SingDelegationOutput>;
} & BaseUseMutationResult<
  SingDelegationOutput,
  SingDelegationError,
  SignDelegationVariables,
  OnMutateResult
>;

export type UseSignDelegation = <OnMutateResult = unknown>(
  args?: UseSignDelegationArgs<OnMutateResult>,
) => UseSignDelegationOutput<OnMutateResult>;
