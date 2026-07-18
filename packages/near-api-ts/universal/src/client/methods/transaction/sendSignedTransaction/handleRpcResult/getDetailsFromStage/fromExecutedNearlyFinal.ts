import type { Result } from '../../../../../../../types/_common/common';
import type { TransactionDetailsFromStageExecutedNearlyFinal } from '../../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import { NatError } from '../../../../../../_common/natError';
import type { TransactionDetailsHandlerContext } from '../handleRpcResult';
import { getCompletedFinalDetails } from './_common/getCompletedFinalDetails';
import { getExecutedNearlyFinalDetails } from './_common/getExecutedNearlyFinalDetails';

export const getDetailsFromStageExecutedNearlyFinal = (
  context: TransactionDetailsHandlerContext,
): Result<
  TransactionDetailsFromStageExecutedNearlyFinal,
  | NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>
> => {
  const { rpcResult } = context;

  if (rpcResult.finalExecutionStatus === 'EXECUTED')
    return getExecutedNearlyFinalDetails({ ...context, rpcDetails: rpcResult });

  if (rpcResult.finalExecutionStatus === 'FINAL')
    return getCompletedFinalDetails({ ...context, rpcDetails: rpcResult });

  throw new Error(`Unexpected rpcResult: ${JSON.stringify(rpcResult)}`);
};
