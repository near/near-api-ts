import type { InvalidTxError } from '@near-js/jsonrpc-types';
import type { Result } from '../../../../../../../types/_common/common';
import type { TransactionConversionFailure } from '../../../../../../../types/_common/transactionDetails/transactionResult';
import type { InnerGetTransactionResultArgs } from '../../../../../../../types/client/methods/transaction/getTransactionResult';
import type { NatError } from '../../../../../../_common/natError';
import type { RpcTransactionOutcomeFailure } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { repackError } from '../../../../../../_common/utils/repackError';
import { result } from '../../../../../../_common/utils/result';
import { getConversionError } from './getConversionError';
import { getConversionStepFailure } from './getConversionStepFailure';

export const getTransactionConversionFailure = (
  transaction: RpcTransactionSummary,
  transactionOutcomeFailure: RpcTransactionOutcomeFailure,
  invalidTxError: InvalidTxError,
  inputArgs: InnerGetTransactionResultArgs,
): Result<
  TransactionConversionFailure<undefined>,
  NatError<'Client.GetTransactionResult.DeserializeActionSummaries.Failed'>
> => {
  const conversionStepError = getConversionStepFailure(
    transaction,
    transactionOutcomeFailure,
    invalidTxError,
    inputArgs.options?.deserializeActionSummaries,
  );

  if (!conversionStepError.ok)
    return repackError({
      error: conversionStepError.error,
      originPrefix: 'Inner.Client.TransactionDetails',
      targetPrefix: 'Client.GetTransactionResult',
    });

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
