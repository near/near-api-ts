import type { ActionError } from '@near-js/jsonrpc-types';
import type { Result } from '../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
} from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type { ExecutionFailure } from '../../../../../types/client/methods/transaction/_common/transactionDetails/executionFailure';
import { type NatError } from '../../../../_common/_common/_common/_common/natError';
import { result } from '../../../../_common/_common/_common/result';
import { getExecutionFailureError } from './_common/_common/getExecutionFailureError/getExecutionFailureError';
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
