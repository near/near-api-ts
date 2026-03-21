import type { MutationObserverResult, MutateOptions } from '@tanstack/react-query';
import type { SignMessageArgs, SignMessageOutput } from '../services/_common.ts';
import type { MutationOptions } from './_common/tanstackMutation.ts';

type UseSignMessageResult<TOnMutateResult> = Omit<
  MutationObserverResult<SignMessageOutput, Error, SignMessageArgs, TOnMutateResult>,
  'mutate'
> & {
  signMessage: (
    args: SignMessageArgs &
      MutateOptions<SignMessageOutput, Error, SignMessageArgs, TOnMutateResult>,
  ) => void;
  signMessageAsync: (
    args: SignMessageArgs &
      MutateOptions<SignMessageOutput, Error, SignMessageArgs, TOnMutateResult>,
  ) => Promise<SignMessageOutput>;
};

type UseSignMessageArgs<TOnMutateResult> = {
  mutation?: MutationOptions<SignMessageOutput, Error, SignMessageArgs, TOnMutateResult>;
};

export type UseSignMessage = <TOnMutateResult = unknown>(
  args?: UseSignMessageArgs<TOnMutateResult>,
) => UseSignMessageResult<TOnMutateResult>;
