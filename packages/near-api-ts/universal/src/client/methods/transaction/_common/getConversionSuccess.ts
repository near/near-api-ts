import type { Result, ResultOk, TransactionHash } from '../../../../../types/_common/common';
import type { BaseDeserializeTransactionActionSummariesFn } from '../../../../../types/_common/transactionDetails/_common/_common/deserializers';
import type { ConversionSuccess } from '../../../../../types/_common/transactionDetails/conversionSuccess';
import { type NatError } from '../../../../_common/natError';
import type { RpcTransactionOutcomeSuccess } from '../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../_common/utils/result';
import { getConversionStepSuccess } from './_common/getConversionStepSuccess';

export const getConversionSuccessConvertedOptimistic = (
  transactionHash: TransactionHash,
): ResultOk<ConversionSuccess['ConvertedOptimistic']> =>
  result.ok({
    transactionHash,
    processingStage: 'ConvertedOptimistic' as const,
    status: 'ConversionSuccess',
  });

export const getConversionSuccessConvertedFinal = (args: {
  transaction: RpcTransactionSummary;
  transactionOutcomeSuccess: RpcTransactionOutcomeSuccess;
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn;
}): Result<
  ConversionSuccess['ConvertedFinal'],
  NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
> => {
  const conversionStepSuccess = getConversionStepSuccess(args);
  if (!conversionStepSuccess.ok) return conversionStepSuccess;

  return result.ok({
    transactionHash: args.transaction.hash.cryptoHash,
    processingStage: 'ConvertedFinal' as const,
    status: 'ConversionSuccess',
    processingSteps: {
      conversionStep: conversionStepSuccess.value,
    },
  });
};
