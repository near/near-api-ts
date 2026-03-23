import type {
  MutationFunctionContext,
  NetworkMode,
  MutationMeta,
  MutationScope,
  MutationObserverResult,
} from '@tanstack/react-query';
import type { DistributiveOmit } from '../../_common/common.ts';

export type MutationOptions<TData, TError, TVariables, TOnMutateResult> = {
  onMutate?: (
    variables: TVariables,
    context: MutationFunctionContext,
  ) => Promise<TOnMutateResult> | TOnMutateResult;
  onSuccess?: (
    data: TData,
    variables: TVariables,
    onMutateResult: TOnMutateResult,
    context: MutationFunctionContext,
  ) => Promise<unknown> | unknown;
  onError?: (
    error: TError,
    variables: TVariables,
    onMutateResult: TOnMutateResult | undefined,
    context: MutationFunctionContext,
  ) => Promise<unknown> | unknown;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    onMutateResult: TOnMutateResult | undefined,
    context: MutationFunctionContext,
  ) => Promise<unknown> | unknown;
  networkMode?: NetworkMode;
  gcTime?: number;
  meta?: MutationMeta;
  scope?: MutationScope;
};

export type BaseUseMutationResult<TData, TError, TVariables, TOnMutateResult> = DistributiveOmit<
  MutationObserverResult<TData, TError, TVariables, TOnMutateResult>,
  'mutate'
>;
