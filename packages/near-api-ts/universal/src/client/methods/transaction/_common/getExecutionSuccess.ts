import type { Base64String, Result } from '../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
} from '../../../../../types/_common/transactionDetails/_common/_common/deserializers';
import type { ExecutionSuccess } from '../../../../../types/_common/transactionDetails/executionSuccess';
import { type NatError, resultNatError } from '../../../../_common/natError';
import type { RpcActionReceipt } from '../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { RpcTransactionOutcomeSuccess } from '../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { tryBase64ToObject } from '../../../../_common/utils/base64ToObject';
import { result } from '../../../../_common/utils/result';
import { getConversionStepSuccess } from './_common/getConversionStepSuccess';
import { getNonConversionSteps } from './_common/getNonConversionSteps/getNonConversionSteps';

type GetExecutionSuccessArgs = {
  transaction: RpcTransactionSummary;
  transactionOutcomeSuccess: RpcTransactionOutcomeSuccess;
  receipts: RpcActionReceipt[];
  receiptsOutcome: RpcReceiptOutcome[];
  statusSuccessValue: Base64String;
  deserializeResultData?: BaseDeserializeTransactionResultDataFn;
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn;
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn;
};

type GetExecutionSuccessError =
  | NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>;

export const getResultData = (
  rawData: Base64String,
  deserializeResultData?: BaseDeserializeTransactionResultDataFn,
): Result<unknown, NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>> => {
  // If a user wants to use his own custom deserializer:
  if (deserializeResultData) {
    try {
      return result.ok(deserializeResultData({ rawData }));
    } catch (cause) {
      return resultNatError('Inner.Client.TransactionDetails.DeserializeResultData.Failed', {
        cause,
        rawData,
      });
    }
  }
  // If no custom deserializer:
  return result.ok(tryBase64ToObject(rawData));
};

const getBaseExecutionSuccess = (args: GetExecutionSuccessArgs) => {
  const { transaction, statusSuccessValue, deserializeResultData } = args;

  const conversionStepSuccess = getConversionStepSuccess(args);
  if (!conversionStepSuccess.ok) return conversionStepSuccess;

  const nonConversionSteps = getNonConversionSteps({
    ...args,
    conversionStepSuccess: conversionStepSuccess.value,
  });
  if (!nonConversionSteps.ok) return nonConversionSteps;

  const resultData = getResultData(statusSuccessValue, deserializeResultData);
  if (!resultData.ok) return resultData;

  return result.ok({
    transactionHash: transaction.hash.cryptoHash,
    status: 'ExecutionSuccess' as const,
    data: resultData.value,
    processingSteps: {
      conversionStep: conversionStepSuccess.value,
      executionSteps: nonConversionSteps.value.executionSteps,
      refundSteps: nonConversionSteps.value.refundSteps,
    },
  });
};

export const getExecutionSuccessExecutedOptimistic = (
  args: GetExecutionSuccessArgs,
): Result<ExecutionSuccess['ExecutedOptimistic'], GetExecutionSuccessError> => {
  const baseExecutionSuccess = getBaseExecutionSuccess(args);
  if (!baseExecutionSuccess.ok) return baseExecutionSuccess;

  const { transactionHash, data, status, processingSteps } = baseExecutionSuccess.value;

  return result.ok({
    transactionHash,
    processingStage: 'ExecutedOptimistic' as const,
    status,
    data,
    processingSteps: {
      conversionStep: processingSteps.conversionStep,
      executionSteps: processingSteps.executionSteps,
    },
  });
};

export const getExecutionSuccessExecutedNearlyFinal = (
  args: GetExecutionSuccessArgs,
): Result<ExecutionSuccess['ExecutedNearlyFinal'], GetExecutionSuccessError> => {
  const baseExecutionSuccess = getBaseExecutionSuccess(args);
  if (!baseExecutionSuccess.ok) return baseExecutionSuccess;

  const { transactionHash, data, status, processingSteps } = baseExecutionSuccess.value;

  return result.ok({
    transactionHash,
    processingStage: 'ExecutedNearlyFinal' as const,
    status,
    data,
    processingSteps: {
      conversionStep: processingSteps.conversionStep,
      executionSteps: processingSteps.executionSteps,
    },
  });
};

export const getExecutionSuccessCompletedFinal = (
  args: GetExecutionSuccessArgs,
): Result<ExecutionSuccess['CompletedFinal'], GetExecutionSuccessError> => {
  const baseExecutionSuccess = getBaseExecutionSuccess(args);
  if (!baseExecutionSuccess.ok) return baseExecutionSuccess;

  const { transactionHash, data, status, processingSteps } = baseExecutionSuccess.value;

  return result.ok({
    transactionHash,
    processingStage: 'CompletedFinal' as const,
    status,
    data,
    processingSteps,
  });
};
