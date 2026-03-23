import type { MutateOptions } from '@tanstack/react-query';
import type { ExecuteTransactionOutput } from '../services/_common.ts';
import type { TransactionIntent } from 'near-api-ts';
import type { MutationOptions, BaseUseMutationResult } from './_common/tanstackMutation.ts';
import type { Prettify } from '../_common/common.ts';

type Variables = {
  intent: TransactionIntent;
};

type Data = ExecuteTransactionOutput;
type Err = Error;

type UseExecuteTransactionArgs<OnMutateResult> = {
  mutation?: MutationOptions<Data, Err, Variables, OnMutateResult>;
};

type ExecuteTransactionArgs<OnMutateResult> = Prettify<
  Variables & { mutate?: MutateOptions<Data, Err, Variables, OnMutateResult> }
>;

type UseExecuteTransactionOutput<OnMutateResult> = {
  executeTransaction: (args: ExecuteTransactionArgs<OnMutateResult>) => void;
  executeTransactionAsync: (args: ExecuteTransactionArgs<OnMutateResult>) => Promise<Data>;
} & BaseUseMutationResult<Data, Err, Variables, OnMutateResult>;

export type UseExecuteTransaction = <OnMutateResult = unknown>(
  args?: UseExecuteTransactionArgs<OnMutateResult>,
) => UseExecuteTransactionOutput<OnMutateResult>;
