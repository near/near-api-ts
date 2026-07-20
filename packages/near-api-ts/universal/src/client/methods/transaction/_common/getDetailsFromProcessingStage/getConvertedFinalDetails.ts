import type { Result, TransactionHash } from '../../../../../../types/_common/common';
import type { BaseDeserializeTransactionActionSummariesFn } from '../../../../../../types/_common/transactionDetails/deserializers';
import type { TransactionDetailsAtStageConvertedFinal } from '../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import type { NatError } from '../../../../../_common/natError';
import type { RpcIncludedFinalTransactionDetails } from '../../../../../_common/schemas/zod/rpc/transactionDetails/transactionDetails';
import { result } from '../../../../../_common/utils/result';
import { getConversionStepSuccess } from '../_common/_common/getConversionStepSuccess';

export const getConvertedFinalDetails = (args: {
  rpcDetails: RpcIncludedFinalTransactionDetails;
  transactionHash: TransactionHash;
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn;
}): Result<
  TransactionDetailsAtStageConvertedFinal,
  NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
> => {
  const { rpcDetails, transactionHash, deserializeActionSummaries } = args;

  const conversionStepSuccess = getConversionStepSuccess(
    rpcDetails.transaction,
    rpcDetails.transactionOutcome,
    deserializeActionSummaries,
  );
  if (!conversionStepSuccess.ok) return conversionStepSuccess;

  return result.ok({
    processingStage: 'ConvertedFinal',
    transactionHash,
    processingSteps: {
      conversionStep: conversionStepSuccess.value,
    },
  });
};
