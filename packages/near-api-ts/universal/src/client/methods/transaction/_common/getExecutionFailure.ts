import type { ActionError } from '@near-js/jsonrpc-types';
import type { Result } from '../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
} from '../../../../../types/_common/transactionDetails/_common/_common/deserializers';
import type { ExecutionFailure } from '../../../../../types/_common/transactionDetails/executionFailure';
import { type NatError } from '../../../../_common/natError';
import type { RpcActionReceipt } from '../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { RpcTransactionOutcomeSuccess } from '../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../_common/utils/result';
import { getExecutionFailureError } from './_common/_common/getExecutionFailureError/getExecutionFailureError';
import { getConversionStepSuccess } from './_common/getConversionStepSuccess';
import { getNonConversionSteps } from './_common/getNonConversionSteps/getNonConversionSteps';

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

const getBaseExecutionFailure = (args: GetExecutionFailureArgs) => {
  const { transaction, actionError } = args;

  const conversionStepSuccess = getConversionStepSuccess(args);
  if (!conversionStepSuccess.ok) return conversionStepSuccess;

  const nonConversionSteps = getNonConversionSteps({
    ...args,
    conversionStepSuccess: conversionStepSuccess.value,
  });
  if (!nonConversionSteps.ok) return nonConversionSteps;

  return result.ok({
    transactionHash: transaction.hash.cryptoHash,
    status: 'ExecutionFailure' as const,
    error: getExecutionFailureError(actionError),
    processingSteps: {
      conversionStep: conversionStepSuccess.value,
      executionSteps: nonConversionSteps.value.executionSteps,
      refundSteps: nonConversionSteps.value.refundSteps,
    },
  });
};

export const getExecutionFailureExecutedOptimistic = (
  args: GetExecutionFailureArgs,
): Result<ExecutionFailure['ExecutedOptimistic'], GetExecutionFailureError> => {
  const baseExecutionFailure = getBaseExecutionFailure(args);
  if (!baseExecutionFailure.ok) return baseExecutionFailure;

  const { transactionHash, error, status, processingSteps } = baseExecutionFailure.value;

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
  if (!baseExecutionFailure.ok) return baseExecutionFailure;

  const { transactionHash, error, status, processingSteps } = baseExecutionFailure.value;

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
  if (!baseExecutionFailure.ok) return baseExecutionFailure;

  const { transactionHash, error, status, processingSteps } = baseExecutionFailure.value;

  return result.ok({
    transactionHash,
    processingStage: 'CompletedFinal' as const,
    status,
    error,
    processingSteps,
  });
};
