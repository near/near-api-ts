import type { Base64String, Result } from '../../../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
} from '../../../../../../../types/_common/transactionDetails/_common/_common/deserializers';
import type { ExecutionFailureErrorAtStage } from '../../../../../../../types/client/methods/transaction/sendSignedTransaction/error';
import type { TransactionDetailsAtStage } from '../../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import { type NatError, resultNatError } from '../../../../../../_common/natError';
import type { RpcExecutedTransactionDetails } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionDetails';
import { isRpcTransactionOutcomeSuccess } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import { getExecutionFailureExecutedNearlyFinal } from '../../../_common/_common/getExecutionFailure';
import { getExecutionSuccessExecutedNearlyFinal } from '../../../_common/_common/getExecutionSuccess';

export const getExecutedNearlyFinalDetails = (args: {
  rpcDetails: RpcExecutedTransactionDetails;
  signedTransactionBorsh64: Base64String;
  deserializeResultData?: BaseDeserializeTransactionResultDataFn;
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn;
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn;
}): Result<
  TransactionDetailsAtStage['ExecutedNearlyFinal'],
  | NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>
  | ExecutionFailureErrorAtStage<'ExecutedNearlyFinal'>
> => {
  const {
    rpcDetails,
    deserializeResultData,
    deserializeActionSummaries,
    deserializeExecutionSteps,
  } = args;

  const { transaction, transactionOutcome, status, receiptsOutcome, receipts } = rpcDetails;

  // #1: When the transaction execution is successful;
  if ('SuccessValue' in status && isRpcTransactionOutcomeSuccess(transactionOutcome))
    return getExecutionSuccessExecutedNearlyFinal({
      transaction,
      transactionOutcomeSuccess: transactionOutcome,
      receipts,
      receiptsOutcome,
      statusSuccessValue: status.SuccessValue,
      deserializeResultData,
      deserializeActionSummaries,
      deserializeExecutionSteps,
    });

  // #2: When the transaction was converted into a receipt and included in the chunk
  // but failed during execution
  if (
    'Failure' in status &&
    'ActionError' in status.Failure &&
    isRpcTransactionOutcomeSuccess(transactionOutcome)
  ) {
    const executionFailure = getExecutionFailureExecutedNearlyFinal({
      transaction,
      transactionOutcomeSuccess: transactionOutcome,
      receipts,
      receiptsOutcome,
      actionError: status.Failure.ActionError,
      deserializeActionSummaries,
      deserializeExecutionSteps,
    });
    if (!executionFailure.ok) return executionFailure;

    return resultNatError(`Client.SendSignedTransaction.Rpc.${executionFailure.value.error.kind}`, {
      signedTransactionBorsh64: args.signedTransactionBorsh64,
      transactionDetails: executionFailure.value,
    });
  }

  throw new Error(`Unexpected rpcDetails: ${JSON.stringify(rpcDetails)}`);
};
