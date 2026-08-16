import type { Base64String, Result, ResultErr } from '../../../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
} from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type {
  ConversionFailureNatError,
  ExecutionFailureErrorAtStage,
} from '../../../../../../../types/client/methods/transaction/sendSignedTransaction/error';
import type { TransactionDetailsAtStage } from '../../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import { type NatError } from '../../../../../../_common/_common/_common/_common/natError';
import { resultNatError } from '../../../../../../_common/_common/_common/result';
import {
  isRpcTransactionOutcomeFailure,
  isRpcTransactionOutcomeSuccess,
} from '../../../_common/_common/zodSchemas/rpcTransactionOutcome';
import { getConversionFailureError } from '../../../_common/getConversionFailureError';
import { getExecutionFailureExecutedOptimistic } from '../../../_common/getExecutionFailure';
import { getExecutionSuccessExecutedOptimistic } from '../../../_common/getExecutionSuccess';
import type { RpcExecutedOptimisticTransactionDetails } from '../../../_common/zodSchemas/rpcTransactionDetails/rpcTransactionDetails';
import type { InnerClientTransactionDetailsError } from './getDetailsFromProcessingStage';

export const getExecutedOptimisticDetails = (args: {
  rpcDetails: RpcExecutedOptimisticTransactionDetails;
  signedTransactionBorsh64: Base64String;
  deserializeResultData?: BaseDeserializeTransactionResultDataFn;
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn;
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn;
}): Result<
  TransactionDetailsAtStage['ExecutedOptimistic'],
  | InnerClientTransactionDetailsError
  | ConversionFailureNatError
  | ExecutionFailureErrorAtStage<'ExecutedOptimistic'>
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
    return getExecutionSuccessExecutedOptimistic({
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
    const executionFailure = getExecutionFailureExecutedOptimistic({
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
