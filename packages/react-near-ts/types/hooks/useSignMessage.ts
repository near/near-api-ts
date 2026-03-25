import type { MutateOptions } from '@tanstack/react-query';
import type { Message, SignedMessage } from 'near-api-ts';
import type { Prettify } from '../_common/common.ts';
import type { BaseUseMutationResult, MutationOptions } from './_common/tanstackMutation.ts';

type Variables = {
  message: Message;
};

type Data = SignedMessage;
type Err = Error;

type UseSignMessageArgs<OnMutateResult> = {
  mutation?: MutationOptions<Data, Err, Variables, OnMutateResult>;
};

type SignMessageArgs<OnMutateResult> = Prettify<
  Variables & { mutate?: MutateOptions<Data, Err, Variables, OnMutateResult> }
>;

type UseSignMessageOutput<OnMutateResult> = {
  signMessage: (args: SignMessageArgs<OnMutateResult>) => void;
  signMessageAsync: (args: SignMessageArgs<OnMutateResult>) => Promise<Data>;
} & BaseUseMutationResult<Data, Err, Variables, OnMutateResult>;

export type UseSignMessage = <OnMutateResult = unknown>(
  args?: UseSignMessageArgs<OnMutateResult>,
) => UseSignMessageOutput<OnMutateResult>;
