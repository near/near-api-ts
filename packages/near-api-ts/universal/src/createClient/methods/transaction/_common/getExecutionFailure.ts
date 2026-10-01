import type { ActionError, ActionView } from '@near-js/jsonrpc-types';
import type { Result } from '../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
} from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type { ConversionStepSuccess } from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/conversionStep';
import type { ExecutionFailure } from '../../../../../types/client/methods/transaction/_common/transactionDetails/executionFailure';
import { type NatError } from '../../../../_common/_common/_common/_common/natError';
import { result } from '../../../../_common/_common/_common/result';
import { getExecutionFailureError } from './_common/_common/getExecutionFailureError/getExecutionFailureError';
import {
  getReceiptsWithOutcomes,
  type ReceiptsWithOutcomes,
} from './_common/_common/getReceiptsWithOutcomes';
import { getConversionStepSuccess } from './_common/getConversionStepSuccess';
import { getNonConversionSteps } from './_common/getNonConversionSteps/getNonConversionSteps';
import type { RpcTransactionOutcomeSuccess } from './_common/zodSchemas/rpcTransactionOutcome';
import type { RpcActionReceipt } from './zodSchemas/rpcTransactionDetails/rpcActionReceipt';
import type { RpcReceiptOutcome } from './zodSchemas/rpcTransactionDetails/rpcReceiptOutcome';
import type { RpcTransactionSummary } from './zodSchemas/rpcTransactionDetails/rpcTransactionSummary';

type GetExecutionFailureArgs = {
  transaction: RpcTransactionSummary;
  transactionOutcomeSuccess: RpcTransactionOutcomeSuccess;
  receipts: RpcActionReceipt[];
  receiptsOutcome: RpcReceiptOutcome[];
  actionError: ActionError;
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn;
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn;
};

type GetExecutionFailureError =
  | NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>;

// Nearcore takes the transaction failure from the receipt it reaches by following SuccessReceiptId
// from the transaction outcome (`get_execution_status`, chain/chain/src/chain.rs). The same walk
// finds the actions of that receipt, which the error's action index points into.
const getFailedReceiptActions = (
  conversionStepSuccess: ConversionStepSuccess,
  receiptsWithOutcomes: ReceiptsWithOutcomes,
): ActionView[] => {
  // Outcomes come in the order nearcore collects them - a receipt before the ones it created - so
  // one pass follows the SuccessReceiptId chain, the way `get_execution_status` does
  const failedReceiptId = receiptsWithOutcomes.reduce(
    (receiptId, { receiptOutcome: { id, outcome } }) =>
      id.cryptoHash === receiptId && 'SuccessReceiptId' in outcome.status
        ? outcome.status.SuccessReceiptId.cryptoHash
        : receiptId,
    conversionStepSuccess.result.firstExecutionStepId,
  );

  const failedReceiptWithOutcome = receiptsWithOutcomes.find(
    ({ receipt }) => receipt.receiptId === failedReceiptId,
  );

  return failedReceiptWithOutcome ? failedReceiptWithOutcome.receipt.receipt.Action.actions : [];
};

const getBaseExecutionFailure = (args: GetExecutionFailureArgs) => {
  const { transaction, actionError, deserializeExecutionSteps } = args;

  const conversionStepSuccess = getConversionStepSuccess(args);
  if (!conversionStepSuccess.success) return conversionStepSuccess;

  const receiptsWithOutcomes = getReceiptsWithOutcomes({
    transaction: args.transaction,
    receipts: args.receipts,
    receiptsOutcome: args.receiptsOutcome,
    conversionStepSuccess: conversionStepSuccess.data,
  });

  const nonConversionSteps = getNonConversionSteps({
    receiptsWithOutcomes,
    conversionStepSuccess: conversionStepSuccess.data,
    deserializeExecutionSteps,
  });
  if (!nonConversionSteps.success) return nonConversionSteps;

  return result.ok({
    transactionHash: transaction.hash.cryptoHash,
    status: 'ExecutionFailure' as const,
    error: getExecutionFailureError(
      actionError,
      getFailedReceiptActions(conversionStepSuccess.data, receiptsWithOutcomes),
    ),
    processingSteps: {
      conversionStep: conversionStepSuccess.data,
      executionSteps: nonConversionSteps.data.executionSteps,
      refundSteps: nonConversionSteps.data.refundSteps,
    },
  });
};

export const getExecutionFailureExecutedOptimistic = (
  args: GetExecutionFailureArgs,
): Result<ExecutionFailure['ExecutedOptimistic'], GetExecutionFailureError> => {
  const baseExecutionFailure = getBaseExecutionFailure(args);
  if (!baseExecutionFailure.success) return baseExecutionFailure;

  const { transactionHash, error, status, processingSteps } = baseExecutionFailure.data;

  return result.ok({
    transactionHash,
    processingStage: 'ExecutedOptimistic' as const,
    status,
    error,
    processingSteps: {
      conversionStep: processingSteps.conversionStep,
      executionSteps: processingSteps.executionSteps,
    },
  });
};

export const getExecutionFailureExecutedNearlyFinal = (
  args: GetExecutionFailureArgs,
): Result<ExecutionFailure['ExecutedNearlyFinal'], GetExecutionFailureError> => {
  const baseExecutionFailure = getBaseExecutionFailure(args);
  if (!baseExecutionFailure.success) return baseExecutionFailure;

  const { transactionHash, error, status, processingSteps } = baseExecutionFailure.data;

  return result.ok({
    transactionHash,
    processingStage: 'ExecutedNearlyFinal' as const,
    status,
    error,
    processingSteps: {
      conversionStep: processingSteps.conversionStep,
      executionSteps: processingSteps.executionSteps,
    },
  });
};

export const getExecutionFailureCompletedFinal = (
  args: GetExecutionFailureArgs,
): Result<ExecutionFailure['CompletedFinal'], GetExecutionFailureError> => {
  const baseExecutionFailure = getBaseExecutionFailure(args);
  if (!baseExecutionFailure.success) return baseExecutionFailure;

  const { transactionHash, error, status, processingSteps } = baseExecutionFailure.data;

  return result.ok({
    transactionHash,
    processingStage: 'CompletedFinal' as const,
    status,
    error,
    processingSteps,
  });
};
