import type { UseMutationResult } from '@tanstack/react-query';
import type { ExecuteTransactionOutput, ExecuteTransactionArgs } from '../services/_common.ts';

export type UseExecuteTransaction = () => UseMutationResult<
  ExecuteTransactionOutput,
  Error,
  ExecuteTransactionArgs,
  unknown
>;
