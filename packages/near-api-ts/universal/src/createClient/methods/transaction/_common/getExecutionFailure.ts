import type { ActionError, ActionView } from '@near-js/jsonrpc-types';
import type { Result } from '../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
} from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type { ExecutionFailureErrorOfEra } from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/executionFailureError';
import type { ProtocolEra } from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/protocolEra';
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

type GetExecutionFailureArgs<PE extends ProtocolEra> = {
  transaction: RpcTransactionSummary;
  transactionOutcomeSuccess: RpcTransactionOutcomeSuccess;
  receipts: RpcActionReceipt[];
  receiptsOutcome: RpcReceiptOutcome[];
  actionError: ActionError;
  protocolEras: PE[];
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn<PE>;
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn<PE>;
};

type GetExecutionFailureError =
  | NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>;

// Nearcore takes the transaction failure from the receipt it reaches by following SuccessReceiptId
// from the transaction outcome (`get_execution_status`, chain/chain/src/chain.rs). The same walk
// finds the actions of that receipt, which the error's action index points into.
const getFailedReceiptActions = (
  conversionStepSuccess: ConversionStepSuccess<'Live' | 'Legacy'>,
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

const getBaseExecutionFailure = <PE extends ProtocolEra>(args: GetExecutionFailureArgs<PE>) => {
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
    protocolEras: args.protocolEras,
    deserializeExecutionSteps,
  });
  if (!nonConversionSteps.success) return nonConversionSteps;

  return result.ok({
    transactionHash: transaction.hash.cryptoHash,
    status: 'ExecutionFailure' as const,
    // `'Legacy'` adds no execution failure yet, so every one is of any era
    error: getExecutionFailureError(
      actionError,
      getFailedReceiptActions(conversionStepSuccess.data, receiptsWithOutcomes),
    ) as ExecutionFailureErrorOfEra<PE>,
    processingSteps: {
      conversionStep: conversionStepSuccess.data,
      executionSteps: nonConversionSteps.data.executionSteps,
      refundSteps: nonConversionSteps.data.refundSteps,
    },
  });
};

export const getExecutionFailureExecutedOptimistic = <PE extends ProtocolEra>(
  args: GetExecutionFailureArgs<PE>,
): Result<ExecutionFailure<PE>['ExecutedOptimistic'], GetExecutionFailureError> => {
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

export const getExecutionFailureExecutedNearlyFinal = <PE extends ProtocolEra>(
  args: GetExecutionFailureArgs<PE>,
): Result<ExecutionFailure<PE>['ExecutedNearlyFinal'], GetExecutionFailureError> => {
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

export const getExecutionFailureCompletedFinal = <PE extends ProtocolEra>(
  args: GetExecutionFailureArgs<PE>,
): Result<ExecutionFailure<PE>['CompletedFinal'], GetExecutionFailureError> => {
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
