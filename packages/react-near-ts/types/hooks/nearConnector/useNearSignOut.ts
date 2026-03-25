import type { MutateOptions } from '@tanstack/react-query';
import type { BaseUseMutationResult, MutationOptions } from '../_common/tanstackMutation.ts';

type Variables = void;
type Data = void;
type Err = Error;

type UseNearSignOutArgs<OnMutateResult> = {
  mutation?: MutationOptions<Data, Err, Variables, OnMutateResult>;
};

type UseNearSignOutResult<OnMutateResult> = {
  signOut: (args?: MutateOptions<Data, Err, Variables, OnMutateResult>) => void;
  signOutAsync: (args?: MutateOptions<Data, Err, Variables, OnMutateResult>) => Promise<Data>;
} & BaseUseMutationResult<Data, Err, Variables, OnMutateResult>;

export type UseNearSignOut = <OnMutateResult = unknown>(
  args?: UseNearSignOutArgs<OnMutateResult>,
) => UseNearSignOutResult<OnMutateResult>;
