import type { Base64String, Result } from '../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
} from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type { ProtocolEra } from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/protocolEra';
import type { ExecutionSuccess } from '../../../../../types/client/methods/transaction/_common/transactionDetails/executionSuccess';
import { type NatError } from '../../../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../../../_common/_common/_common/result';
import { tryBase64ToObject } from '../../_common/base64ToObject';
import { getConversionStepSuccess } from './_common/getConversionStepSuccess';
import { getNonConversionSteps } from './_common/getNonConversionSteps/getNonConversionSteps';
import { getReceiptsWithOutcomes } from './_common/getReceiptsWithOutcomes';
import type { RpcTransactionOutcomeSuccess } from './_common/zodSchemas/rpcTransactionOutcome';
import type { RpcActionReceipt } from './zodSchemas/rpcTransactionDetails/rpcActionReceipt';
import type { RpcReceiptOutcome } from './zodSchemas/rpcTransactionDetails/rpcReceiptOutcome';
import type { RpcTransactionSummary } from './zodSchemas/rpcTransactionDetails/rpcTransactionSummary';

type GetExecutionSuccessArgs<PE extends ProtocolEra> = {
  transaction: RpcTransactionSummary;
  transactionOutcomeSuccess: RpcTransactionOutcomeSuccess;
  receipts: RpcActionReceipt[];
  receiptsOutcome: RpcReceiptOutcome[];
  statusSuccessValue: Base64String;
  deserializeResultData?: BaseDeserializeTransactionResultDataFn;
  protocolEras: PE[];
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn<PE>;
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn<PE>;
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

const getBaseExecutionSuccess = <PE extends ProtocolEra>(args: GetExecutionSuccessArgs<PE>) => {
  const { transaction, statusSuccessValue, deserializeResultData, deserializeExecutionSteps } =
    args;

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

  const resultData = getResultData(statusSuccessValue, deserializeResultData);
  if (!resultData.success) return resultData;

  return result.ok({
    transactionHash: transaction.hash.cryptoHash,
    status: 'ExecutionSuccess' as const,
    data: resultData.data,
    processingSteps: {
      conversionStep: conversionStepSuccess.data,
      executionSteps: nonConversionSteps.data.executionSteps,
      refundSteps: nonConversionSteps.data.refundSteps,
    },
  });
};

export const getExecutionSuccessExecutedOptimistic = <PE extends ProtocolEra>(
  args: GetExecutionSuccessArgs<PE>,
): Result<ExecutionSuccess<PE>['ExecutedOptimistic'], GetExecutionSuccessError> => {
  const baseExecutionSuccess = getBaseExecutionSuccess(args);
  if (!baseExecutionSuccess.success) return baseExecutionSuccess;

  const { transactionHash, data, status, processingSteps } = baseExecutionSuccess.data;

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

export const getExecutionSuccessExecutedNearlyFinal = <PE extends ProtocolEra>(
  args: GetExecutionSuccessArgs<PE>,
): Result<ExecutionSuccess<PE>['ExecutedNearlyFinal'], GetExecutionSuccessError> => {
  const baseExecutionSuccess = getBaseExecutionSuccess(args);
  if (!baseExecutionSuccess.success) return baseExecutionSuccess;

  const { transactionHash, data, status, processingSteps } = baseExecutionSuccess.data;

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

export const getExecutionSuccessCompletedFinal = <PE extends ProtocolEra>(
  args: GetExecutionSuccessArgs<PE>,
): Result<ExecutionSuccess<PE>['CompletedFinal'], GetExecutionSuccessError> => {
  const baseExecutionSuccess = getBaseExecutionSuccess(args);
  if (!baseExecutionSuccess.success) return baseExecutionSuccess;

  const { transactionHash, data, status, processingSteps } = baseExecutionSuccess.data;

  return result.ok({
    transactionHash,
    processingStage: 'CompletedFinal' as const,
    status,
    data,
    processingSteps,
  });
};
