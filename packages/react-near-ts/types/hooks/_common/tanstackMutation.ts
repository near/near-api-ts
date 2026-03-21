import type { MutationFunctionContext, NetworkMode, MutationMeta, MutationScope } from '@tanstack/react-query';

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
