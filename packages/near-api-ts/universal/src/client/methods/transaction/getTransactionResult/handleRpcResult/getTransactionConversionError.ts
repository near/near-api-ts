import type { Result } from '../../../../../../types/_common/common';
import type { TransactionConversionError } from '../../../../../../types/_common/transactionDetails/transactionResult';
import type { InnerGetTransactionResultArgs } from '../../../../../../types/client/methods/transaction/getTransactionResult';
import type { NatError } from '../../../../../_common/natError';
import type { RpcTransactionOutcomeFailure } from '../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../../_common/utils/result';
import { getConversionStepError } from './_common/getProcessingSteps/getConversionStep';

export const getTransactionConversionError = (
  transaction: RpcTransactionSummary,
  transactionOutcomeFailure: RpcTransactionOutcomeFailure,
  status: any,
  inputArgs: InnerGetTransactionResultArgs,
): Result<
  TransactionConversionError<undefined>,
  NatError<'Client.GetTransactionResult.DeserializeActionSummaries.Failed'>
> => {
  const conversionStepError = getConversionStepError(
    transaction,
    transactionOutcomeFailure,
    inputArgs,
  );
  if (!conversionStepError.ok) return conversionStepError;

  return result.ok({
    transactionHash: transaction.hash.cryptoHash,
    result: {
      status: 'ConversionError',
      error: {
        kind: 'any',
        context: status.Failure.InvalidTxError,
      },
    },
    processingSteps: {
      conversionStep: conversionStepError.value,
      executionSteps: null,
      refundSteps: null,
    },
  });
};
