import type { InvalidTxError } from '@near-js/jsonrpc-types';
import type { Result } from '../../../../../../../types/_common/common';
import type { BaseDeserializeTransactionActionSummariesFn } from '../../../../../../../types/_common/transactionDetails/deserializers';
import type { TransactionConversionFailure } from '../../../../../../../types/_common/transactionDetails/transactionResult';
import type { NatError } from '../../../../../../_common/natError';
import type { RpcTransactionOutcomeFailure } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../../../_common/utils/result';
import { getConversionError } from './getConversionError';
import { getConversionStepFailure } from './getConversionStepFailure';

export const getTransactionConversionFailure = (
  transaction: RpcTransactionSummary,
  transactionOutcomeFailure: RpcTransactionOutcomeFailure,
  invalidTxError: InvalidTxError,
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn,
): Result<
  TransactionConversionFailure,
  NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
> => {
  const conversionStepError = getConversionStepFailure(
    transaction,
    transactionOutcomeFailure,
    invalidTxError,
    deserializeActionSummaries,
  );
  if (!conversionStepError.ok) return conversionStepError;

  return result.ok({
    transactionHash: transaction.hash.cryptoHash,
    result: {
      status: 'ConversionError',
      error: getConversionError(invalidTxError),
    },
    processingSteps: {
      conversionStep: conversionStepError.value,
      executionSteps: null,
      refundSteps: null,
    },
  });
};
