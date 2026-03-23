import type { Message, SignedMessage } from 'near-api-ts';
import type { MutateOptions } from '@tanstack/react-query';
import type { BaseUseMutationResult, MutationOptions } from '../../_common/tanstackMutation.ts';
import type { Prettify } from '../../../_common/common.ts';

export type Variables = {
  message: Message;
};

type Data = SignedMessage;
type Err = Error;

export type WithSignMessageArgs<OnMutateResult> = {
  additionalAction: 'SignMessage';
  mutation?: MutationOptions<Data, Err, Variables, OnMutateResult>;
};

type ConnectArgs<OnMutateResult> = Prettify<
  Variables & { mutate?: MutateOptions<Data, Err, Variables, OnMutateResult> }
>;

export type WithSignMessageOutput<OnMutateResult> = {
  connect: (args: ConnectArgs<OnMutateResult>) => void;
  connectAsync: (args: ConnectArgs<OnMutateResult>) => Promise<Data>;
} & BaseUseMutationResult<Data, Err, Variables, OnMutateResult>;
