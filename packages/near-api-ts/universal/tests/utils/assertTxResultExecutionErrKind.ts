import { expect } from 'vitest';
import type {
  ExecutionFailureError,
  ExecutionFailureKind,
} from '../../types/_common/transactionDetails/_common/_common/executionFailureError';
import type { TransactionResult } from '../../types/_common/transactionDetails/_common/transactionResult';

/**
 * Asserts that a getTransactionResult() result failed during execution with the given
 * ExecutionError kind, narrowing the result union to the ExecutionError branch so callers can
 * read `txResult.result.error.context` with the kind-specific type.
 */
export function assertTxResultExecutionErrKind<K extends ExecutionFailureKind>(
  txResult: TransactionResult,
  kind: K,
): asserts txResult is TransactionResult & {
  result: { status: 'ExecutionError'; error: ExecutionFailureError<K> };
} {
  expect(txResult.status).toBe('ExecutionError');
  if (txResult.status !== 'ExecutionError') {
    throw new Error(`Expected ExecutionError result, got "${txResult.status}"`);
  }
  expect(txResult.error.kind).toBe(kind);
}
