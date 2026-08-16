import type {
  Result,
  ResultOk,
  TransactionHash,
} from '../../../../../../../../types/_common/common';
import type { BaseDeserializeTransactionActionSummariesFn } from '../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type { ConversionSuccess } from '../../../../../../../../types/client/methods/transaction/_common/transactionDetails/conversionSuccess';
import { type NatError } from '../../../../../../../_common/_common/_common/_common/natError';
import { result } from '../../../../../../../_common/_common/_common/result';
import { getConversionStepSuccess } from '../../../../_common/_common/getConversionStepSuccess';
import type { RpcTransactionOutcomeSuccess } from '../../../../_common/_common/zodSchemas/rpcTransactionOutcome';
import type { RpcTransactionSummary } from '../../../../_common/zodSchemas/rpcTransactionDetails/rpcTransactionSummary';

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
