import type { Base64String } from '../../../../../../../../../types/_common/common';
import type {
  ExecutionStepResult,
  ParsedExecutionStep,
  RawExecutionStep,
} from '../../../../../../../../../types/_common/transactionDetails/processingSteps/executionSteps/executionStep';
import { tryBase64ToObject } from '../../../../../../../../_common/utils/base64ToObject';
import { getParsedActionSummary } from '../../../../../_common/processingSteps/getActionSummary/getParsedActionSummary';

const getParsedResult = (
  rawResult: ExecutionStepResult<Base64String>,
): ExecutionStepResult<unknown> =>
  rawResult.status === 'Success'
    ? { status: 'Success', data: tryBase64ToObject(rawResult.data) }
    : rawResult;

export const getParsedExecutionStep = (
  rawExecutionStep: RawExecutionStep,
): ParsedExecutionStep => ({
  executionStepId: rawExecutionStep.executionStepId,
  result: getParsedResult(rawExecutionStep.result),
  createdAt: rawExecutionStep.createdAt,
  createdBy: rawExecutionStep.createdBy,
  executedAt: rawExecutionStep.executedAt,
  executedBy: rawExecutionStep.executedBy,
  producedSteps: rawExecutionStep.producedSteps,
  actionSummaries: rawExecutionStep.actionSummaries.map(getParsedActionSummary),
  requiredDataIds: rawExecutionStep.requiredDataIds,
  futureDataReceivers: rawExecutionStep.futureDataReceivers,
  isPromiseYield: rawExecutionStep.isPromiseYield,
  gasFee: rawExecutionStep.gasFee,
  gasUsed: rawExecutionStep.gasUsed,
  logs: rawExecutionStep.logs,
});
