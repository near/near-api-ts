import type { Result, TransactionHash } from '../../../../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
} from '../../../../../../../../types/_common/transactionDetails/deserializers';
import type { TransactionDetailsAtStageCompletedFinal } from '../../../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import type { NatError } from '../../../../../../../_common/natError';
import type { RpcFinalTransactionDetails } from '../../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionDetails';
import {
  isRpcTransactionOutcomeFailure,
  isRpcTransactionOutcomeSuccess,
} from '../../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import { result } from '../../../../../../../_common/utils/result';
import { getTransactionSuccess } from '../../../../_common/getTransactionSuccess/getTransactionSuccess';

export const getCompletedFinalDetails = (args: {
  rpcDetails: RpcFinalTransactionDetails;
  transactionHash: TransactionHash;
  deserializeResultData?: BaseDeserializeTransactionResultDataFn;
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn;
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn;
}): Result<
  TransactionDetailsAtStageCompletedFinal,
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
      processingStage: 'CompletedFinal',
      transactionHash,
      result: {
        data: transactionSuccess.value.result.data,
      },
      processingSteps: {
        conversionStep: transactionSuccess.value.processingSteps.conversionStep,
        executionSteps: transactionSuccess.value.processingSteps.executionSteps,
        refundSteps: transactionSuccess.value.processingSteps.refundSteps,
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

  // #3: When the invalid transaction was included in the chunk because
  // chunk provider's bug or intent;
  // It's a theoretical case - normally RPC / chunk provider won't include it in mempool
  // and will return HandlerError;
  if (
    'Failure' in status &&
    'InvalidTxError' in status.Failure &&
    isRpcTransactionOutcomeFailure(transactionOutcome)
  ) {
    // TODO Finish after implement handling handlerError -> INVALID_TRANSACTION
    // should return the same error
    throw new Error('NatError -> InvalidTxError');
  }

  throw new Error(`Unexpected rpcDetails: ${JSON.stringify(rpcDetails)}`);
};
