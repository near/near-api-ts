import type { Result } from '../../../../../../../types/_common/common';
import type { TransactionDetailsFromStageConvertedOptimistic } from '../../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import { NatError } from '../../../../../../_common/natError';
import type { TransactionDetailsHandlerContext } from '../handleRpcResult';
import { getCompletedFinalDetails } from './_common/getCompletedFinalDetails';
import { getConvertedFinalDetails } from './_common/getConvertedFinalDetails';
import { getConvertedOptimisticDetails } from './_common/getConvertedOptimisticDetails';
import { getExecutedNearlyFinalDetails } from './_common/getExecutedNearlyFinalDetails';
import { getExecutedOptimisticDetails } from './_common/getExecutedOptimisticDetails';

export const getDetailsFromStageConvertedOptimistic = (
  context: TransactionDetailsHandlerContext,
): Result<
  TransactionDetailsFromStageConvertedOptimistic,
  | NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>
> => {
  const { rpcResult } = context;

  if (rpcResult.finalExecutionStatus === 'INCLUDED') return getConvertedOptimisticDetails(context);

  if (rpcResult.finalExecutionStatus === 'INCLUDED_FINAL')
    return getConvertedFinalDetails({ ...context, rpcDetails: rpcResult });

  if (rpcResult.finalExecutionStatus === 'EXECUTED_OPTIMISTIC')
    return getExecutedOptimisticDetails({ ...context, rpcDetails: rpcResult });

  if (rpcResult.finalExecutionStatus === 'EXECUTED')
    return getExecutedNearlyFinalDetails({ ...context, rpcDetails: rpcResult });

  if (rpcResult.finalExecutionStatus === 'FINAL')
    return getCompletedFinalDetails({ ...context, rpcDetails: rpcResult });

  throw new Error(`Unexpected rpcResult: ${JSON.stringify(rpcResult)}`);
};
