import { expect } from 'vitest';
import type {
  ExecutionFailureError,
  ExecutionFailureKind,
} from '../../types/_common/transactionDetails/_common/_common/executionFailureError';
import type { ExecutionFailure } from '../../types/_common/transactionDetails/executionFailure';
import type { GetTransactionResultOutput } from '../../types/client/methods/transaction/getTransactionResult';

/**
 * Asserts that a getTransactionResult() result failed during execution with the given
 * ExecutionFailure kind, narrowing the result union to the ExecutionFailure branch so callers can
 * read `txResult.error.context` with the kind-specific type.
 */
export function assertTxResultExecutionErrKind<K extends ExecutionFailureKind>(
  txResult: GetTransactionResultOutput,
  kind: K,
): asserts txResult is ExecutionFailure['CompletedFinal'] & {
  error: ExecutionFailureError<K>;
} {
  expect(txResult.status).toBe('ExecutionFailure');
  if (txResult.status !== 'ExecutionFailure') {
    throw new Error(`Expected ExecutionFailure result, got "${txResult.status}"`);
  }
  expect(txResult.error.kind).toBe(kind);
}
