import type { Result, TransactionHash } from '../../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
} from '../../../../../../types/_common/transactionDetails/deserializers';
import type { TransactionDetailsAtStageExecutedNearlyFinal } from '../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import type { NatError } from '../../../../../_common/natError';
import type { RpcExecutedTransactionDetails } from '../../../../../_common/schemas/zod/rpc/transactionDetails/transactionDetails';
import { isRpcTransactionOutcomeSuccess } from '../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import { result } from '../../../../../_common/utils/result';
import { getTransactionSuccess } from '../_common/getTransactionSuccess/getTransactionSuccess';

export const getExecutedNearlyFinalDetails = (args: {
  rpcDetails: RpcExecutedTransactionDetails;
  transactionHash: TransactionHash;
  deserializeResultData?: BaseDeserializeTransactionResultDataFn;
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn;
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn;
}): Result<
  TransactionDetailsAtStageExecutedNearlyFinal,
  | NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>
> => {
  const {
    rpcDetails,
    transactionHash,
    deserializeResultData,
    deserializeActionSummaries,
    deserializeExecutionSteps,
  } = args;

  const { transaction, transactionOutcome, status, receiptsOutcome, receipts } = rpcDetails;

  // #1: When the transaction execution is successful;
  if ('SuccessValue' in status && isRpcTransactionOutcomeSuccess(transactionOutcome)) {
    const transactionSuccess = getTransactionSuccess(
      transaction,
      transactionOutcome,
      receipts,
      receiptsOutcome,
      status.SuccessValue,
      deserializeResultData,
      deserializeActionSummaries,
      deserializeExecutionSteps,
    );
    if (!transactionSuccess.ok) return transactionSuccess;

    return result.ok({
      processingStage: 'ExecutedNearlyFinal',
      transactionHash,
      result: {
        data: transactionSuccess.value.result.data,
      },
      processingSteps: {
        conversionStep: transactionSuccess.value.processingSteps.conversionStep,
        executionSteps: transactionSuccess.value.processingSteps.executionSteps,
      },
    });
  }

  // #2: When the transaction was converted into a receipt and included in the chunk
  // but failed during execution
  if (
    'Failure' in status &&
    'ActionError' in status.Failure &&
    isRpcTransactionOutcomeSuccess(transactionOutcome)
  ) {
    // TODO Finish
    throw new Error('NatError -> ActionError');
  }

  throw new Error(`Unexpected rpcDetails: ${JSON.stringify(rpcDetails)}`);
};
