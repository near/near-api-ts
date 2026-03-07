import type { UseMutationResult } from '@tanstack/react-query';
import type { ExecuteTransactionOutput } from '../services/_common.ts';
import type { TransactionIntent } from 'near-api-ts';

export type ExecuteTransactionArgs = {
  intent: TransactionIntent;
};

export type UseExecuteTransaction = () => UseMutationResult<
  ExecuteTransactionOutput,
  Error,
  ExecuteTransactionArgs,
  unknown
>;
