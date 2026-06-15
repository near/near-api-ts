import { expect } from 'vitest';
import type {
  ExecutionError,
  ExecutionErrorKind,
} from '../../types/_common/transactionDetails/processingSteps/executionSteps/executionError';
import type { TransactionResult } from '../../types/_common/transactionDetails/transactionResult';

/**
 * Asserts that a getTransactionResult() result failed during execution with the given
 * ExecutionError kind, narrowing the result union to the ExecutionError branch so callers can
 * read `txResult.result.error.context` with the kind-specific type.
 */
export function assertTxResultExecutionErrKind<K extends ExecutionErrorKind>(
  txResult: TransactionResult,
  kind: K,
): asserts txResult is TransactionResult & {
  result: { status: 'ExecutionError'; error: ExecutionError<K> };
} {
  expect(txResult.result.status).toBe('ExecutionError');
  if (txResult.result.status !== 'ExecutionError') {
    throw new Error(`Expected ExecutionError result, got "${txResult.result.status}"`);
  }
  expect(txResult.result.error.kind).toBe(kind);
}
