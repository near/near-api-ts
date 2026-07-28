import type { Base64String, Result, ResultErr } from '../../../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
} from '../../../../../../../types/_common/transactionDetails/_common/_common/deserializers';
import type {
  ConversionFailureNatError,
  ExecutionFailureErrorAtStage,
} from '../../../../../../../types/client/methods/transaction/sendSignedTransaction/error';
import type { TransactionDetailsAtStage } from '../../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import { resultNatError } from '../../../../../../_common/natError';
import type { RpcFinalTransactionDetails } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionDetails';
import {
  isRpcTransactionOutcomeFailure,
  isRpcTransactionOutcomeSuccess,
} from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import { getConversionFailureError } from '../../../_common/_common/getConversionFailureError';
import { getExecutionFailureCompletedFinal } from '../../../_common/getExecutionFailure';
import { getExecutionSuccessCompletedFinal } from '../../../_common/getExecutionSuccess';
import type { InnerClientTransactionDetailsError } from './getDetailsFromProcessingStage';

export const getCompletedFinalDetails = (args: {
  rpcDetails: RpcFinalTransactionDetails;
  signedTransactionBorsh64: Base64String;
  deserializeResultData?: BaseDeserializeTransactionResultDataFn;
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn;
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn;
}): Result<
  TransactionDetailsAtStage['CompletedFinal'],
  | InnerClientTransactionDetailsError
  | ConversionFailureNatError
  | ExecutionFailureErrorAtStage<'CompletedFinal'>
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
    return getExecutionSuccessCompletedFinal({
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
    const executionFailure = getExecutionFailureCompletedFinal({
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
      transactionDetails: executionFailure.value,
      signedTransactionBorsh64: args.signedTransactionBorsh64,
    });
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
    const error = getConversionFailureError(status.Failure.InvalidTxError);

    return resultNatError(`Client.SendSignedTransaction.Rpc.${error.kind}`, {
      info: error.context,
      signedTransactionBorsh64: args.signedTransactionBorsh64,
    }) as ResultErr<ConversionFailureNatError>;
  }

  throw new Error(`Unexpected rpcDetails: ${JSON.stringify(rpcDetails)}`);
};
