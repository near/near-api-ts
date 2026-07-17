import type { Result, TransactionHash } from '../../../../../../../../types/_common/common';
import type { BaseDeserializeTransactionActionSummariesFn } from '../../../../../../../../types/_common/transactionDetails/deserializers';
import type { TransactionDetailsAtStageConvertedFinal } from '../../../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import type { NatError } from '../../../../../../../_common/natError';
import type { RpcIncludedFinalTransactionDetails } from '../../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionDetails';
import { repackError } from '../../../../../../../_common/utils/repackError';
import { result } from '../../../../../../../_common/utils/result';
import { getConversionStepSuccess } from '../../../../_common/processingSteps/getConversionStepSuccess';

export const getConvertedFinalDetails = (
  rpcDetails: RpcIncludedFinalTransactionDetails,
  transactionHash: TransactionHash,
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn,
): Result<
  TransactionDetailsAtStageConvertedFinal<undefined>,
  NatError<'Client.SendSignedTransaction.DeserializeActionSummaries.Failed'>
> => {
  const conversionStepSuccess = getConversionStepSuccess(
    rpcDetails.transaction,
    rpcDetails.transactionOutcome,
    deserializeActionSummaries,
  );

  if (!conversionStepSuccess.ok)
    return repackError({
      error: conversionStepSuccess.error,
      originPrefix: 'Inner.Client.TransactionDetails',
      targetPrefix: 'Client.SendSignedTransaction',
    });

  return result.ok({
    processingStage: 'ConvertedFinal',
    transactionHash,
    processingSteps: {
      conversionStep: conversionStepSuccess.value,
    },
  });
};
