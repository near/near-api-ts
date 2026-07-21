import { expect } from 'vitest';
import type {
  ExecutionFailure,
  ExecutionFailureKind,
} from '../../types/_common/transactionDetails/processingSteps/executionSteps/executionFailure';
import type { TransactionResult } from '../../types/_common/transactionDetails/transactionResult';

/**
 * Asserts that a getTransactionResult() result failed during execution with the given
 * ExecutionError kind, narrowing the result union to the ExecutionError branch so callers can
 * read `txResult.result.error.context` with the kind-specific type.
 */
export function assertTxResultExecutionErrKind<K extends ExecutionFailureKind>(
  txResult: TransactionResult,
  kind: K,
): asserts txResult is TransactionResult & {
  result: { status: 'ExecutionError'; error: ExecutionFailure<K> };
} {
  expect(txResult.status).toBe('ExecutionError');
  if (txResult.status !== 'ExecutionError') {
    throw new Error(`Expected ExecutionError result, got "${txResult.status}"`);
  }
  expect(txResult.error.kind).toBe(kind);
}
