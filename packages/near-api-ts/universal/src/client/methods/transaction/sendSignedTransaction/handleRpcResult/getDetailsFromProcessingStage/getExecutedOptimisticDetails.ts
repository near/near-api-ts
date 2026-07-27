import type { Base64String, Result } from '../../../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
} from '../../../../../../../types/_common/transactionDetails/_common/_common/deserializers';
import type { ExecutionFailureErrorAtStage } from '../../../../../../../types/client/methods/transaction/sendSignedTransaction/error';
import type { TransactionDetailsAtStage } from '../../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import { type NatError, resultNatError } from '../../../../../../_common/natError';
import type { RpcExecutedOptimisticTransactionDetails } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionDetails';
import {
  isRpcTransactionOutcomeFailure,
  isRpcTransactionOutcomeSuccess,
} from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import { getExecutionFailureExecutedOptimistic } from '../../../_common/getExecutionFailure';
import { getExecutionSuccessExecutedOptimistic } from '../../../_common/getExecutionSuccess';
import type { InnerClientTransactionDetailsError } from './getDetailsFromProcessingStage';

export const getExecutedOptimisticDetails = (args: {
  rpcDetails: RpcExecutedOptimisticTransactionDetails;
  signedTransactionBorsh64: Base64String;
  deserializeResultData?: BaseDeserializeTransactionResultDataFn;
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn;
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn;
}): Result<
  TransactionDetailsAtStage['ExecutedOptimistic'],
  InnerClientTransactionDetailsError | ExecutionFailureErrorAtStage<'ExecutedOptimistic'>
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
      signedTransactionBorsh64: args.signedTransactionBorsh64,
      transactionDetails: executionFailure.value,
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
    // TODO Finish after implement handling handlerError -> INVALID_TRANSACTION
    // should return the same error
    throw new Error('NatError -> InvalidTxError');
  }

  throw new Error(`Unexpected rpcDetails: ${JSON.stringify(rpcDetails)}`);
};
