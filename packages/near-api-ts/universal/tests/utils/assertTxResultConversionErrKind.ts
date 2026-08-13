import { expect } from 'vitest';
import type {
  ConversionFailureError,
  ConversionFailureKind,
} from '../../types/client/methods/transaction/_common/transactionDetails/_common/_common/conversionFailureError';
import type { ConversionFailure } from '../../types/client/methods/transaction/_common/transactionDetails/conversionFailure';
import type { GetTransactionResultOutput } from '../../types/client/methods/transaction/getTransactionResult';

/**
 * Conversion-failure twin of `assertTxResultExecutionErrKind`: asserts that a
 * getTransactionResult() result never made it past conversion into a receipt and carries the given
 * ConversionFailure kind, narrowing the result union to the ConversionFailure branch so callers can
 * read `txResult.error.context` with the kind-specific type.
 */
export function assertTxResultConversionErrKind<K extends ConversionFailureKind>(
  txResult: GetTransactionResultOutput,
  kind: K,
): asserts txResult is ConversionFailure['CompletedFinal'] & {
  error: ConversionFailureError<K>;
} {
  expect(txResult.status).toBe('ConversionFailure');
  if (txResult.status !== 'ConversionFailure') {
    throw new Error(`Expected ConversionFailure result, got "${txResult.status}"`);
  }
  expect(txResult.error.kind).toBe(kind);
}
