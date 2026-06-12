import type { Base64String, Result } from '../../../../../../../../../types/_common/common';
import type {
  ExecutionStepResult,
  ExecutionSteps,
  ParsedExecutionStep,
  RawExecutionStep,
} from '../../../../../../../../../types/_common/transactionDetails/processingSteps/executionStep';
import type { MaybeBaseDeserializeTransactionExecutionStepsFn } from '../../../../../../../../../types/_common/transactionDetails/transactionResult';
import type { InnerGetTransactionResultArgs } from '../../../../../../../../../types/client/methods/transaction/getTransactionResult';
import { type NatError, resultNatError } from '../../../../../../../../_common/natError';
import { result } from '../../../../../../../../_common/utils/result';
import { tryParseBase64ToObject } from '../../_common/tryParseBase64ToObject';
import { baseGetActionSummary } from '../_common/getActionSummaries';

const baseGetExecutionStepResult = (
  rawResult: ExecutionStepResult<Base64String>,
): ExecutionStepResult<unknown> =>
  rawResult.status === 'Success'
    ? { status: 'Success', data: tryParseBase64ToObject(rawResult.data) }
    : rawResult;

const getParsedExecutionStep = (rawExecutionStep: RawExecutionStep): ParsedExecutionStep => ({
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

export const deserializeExecutionSteps = <
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
>(
  inputArgs: InnerGetTransactionResultArgs,
  rawExecutionSteps: RawExecutionStep[],
): Result<
  ExecutionSteps<ESF>,
  NatError<'Client.GetTransactionResult.DeserializeExecutionSteps.Failed'>
> => {
  // If a user wants to use his own custom deserializer:
  if (inputArgs.options?.deserializeExecutionSteps) {
    try {
      return result.ok(
        inputArgs.options.deserializeExecutionSteps({ rawExecutionSteps }) as ExecutionSteps<ESF>,
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
  return result.ok(rawExecutionSteps.map(getParsedExecutionStep) as ExecutionSteps<ESF>);
};
