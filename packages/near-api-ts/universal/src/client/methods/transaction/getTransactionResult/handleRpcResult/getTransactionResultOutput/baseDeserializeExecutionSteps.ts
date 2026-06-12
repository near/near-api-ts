import type { Result } from '../../../../../../../types/_common/common';
import type {
  ExecutionStep,
  ExecutionStepResult,
  ExecutionSteps,
  RawExecutionStep,
  RawExecutionStepResult,
} from '../../../../../../../types/_common/transactionDetails/processingSteps/executionStep';
import type { MaybeBaseDeserializeTransactionExecutionStepsFn } from '../../../../../../../types/_common/transactionDetails/transactionResult';
import type { InnerGetTransactionResultArgs } from '../../../../../../../types/client/methods/transaction/getTransactionResult';
import { type NatError, resultNatError } from '../../../../../../_common/natError';
import { result } from '../../../../../../_common/utils/result';
import { baseParseBase64Data } from './_common/parseBase64Data';
import { baseGetActionSummary } from './getProcessingSteps/_common/getActionSummaries';

const baseGetExecutionStepResult = (rawResult: RawExecutionStepResult): ExecutionStepResult =>
  rawResult.status === 'Success'
    ? { status: 'Success', data: baseParseBase64Data(rawResult.data) }
    : rawResult;

const baseGetExecutionStep = (rawExecutionStep: RawExecutionStep): ExecutionStep => ({
  executionStepId: rawExecutionStep.executionStepId,
  result: baseGetExecutionStepResult(rawExecutionStep.result),
  createdAt: rawExecutionStep.createdAt,
  createdBy: rawExecutionStep.createdBy,
  executedAt: rawExecutionStep.executedAt,
  executedBy: rawExecutionStep.executedBy,
  producedSteps: rawExecutionStep.producedSteps,
  actionSummaries: rawExecutionStep.actionSummaries.map(baseGetActionSummary),
  requiredDataIds: rawExecutionStep.requiredDataIds,
  futureDataReceivers: rawExecutionStep.futureDataReceivers,
  isPromiseYield: rawExecutionStep.isPromiseYield,
  gasFee: rawExecutionStep.gasFee,
  gasUsed: rawExecutionStep.gasUsed,
  logs: rawExecutionStep.logs,
});

export const baseDeserializeExecutionSteps = <
  ES extends MaybeBaseDeserializeTransactionExecutionStepsFn,
>(
  inputArgs: InnerGetTransactionResultArgs,
  rawExecutionSteps: RawExecutionStep[],
): Result<
  ExecutionSteps<ES>,
  NatError<'Client.GetTransactionResult.DeserializeExecutionSteps.Failed'>
> => {
  // If a user wants to use his own custom deserializer:
  if (inputArgs.options?.deserializeExecutionSteps) {
    try {
      return result.ok(
        inputArgs.options.deserializeExecutionSteps({ rawExecutionSteps }) as ExecutionSteps<ES>,
      );
    } catch (cause) {
      return resultNatError('Client.GetTransactionResult.DeserializeExecutionSteps.Failed', {
        cause,
        rawExecutionSteps,
      });
    }
  }
  // If no custom deserializer is provided, use the default one and return default ExecutionSteps
  // with unknown result.data type and unknown functionCall.functionArgs type;
  return result.ok(rawExecutionSteps.map(baseGetExecutionStep) as ExecutionSteps<ES>);
};
