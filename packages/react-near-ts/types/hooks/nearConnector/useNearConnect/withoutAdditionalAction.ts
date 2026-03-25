import type { MutateOptions } from '@tanstack/react-query';
import type { BaseUseMutationResult, MutationOptions } from '../../_common/tanstackMutation.ts';

type Variables = void;
type Data = void;
type Err = Error;

export type WithoutAdditionalActionArgs<OnMutateResult> = {
  additionalAction?: never;
  mutation?: MutationOptions<Data, Err, Variables, OnMutateResult>;
};

type ConnectArgs<OnMutateResult> = {
  mutate?: MutateOptions<Data, Err, Variables, OnMutateResult>;
};

export type WithoutAdditionalActionOutput<OnMutateResult> = {
  connect: (args?: ConnectArgs<OnMutateResult>) => void;
  connectAsync: (args?: ConnectArgs<OnMutateResult>) => Promise<Data>;
} & BaseUseMutationResult<Data, Err, Variables, OnMutateResult>;
