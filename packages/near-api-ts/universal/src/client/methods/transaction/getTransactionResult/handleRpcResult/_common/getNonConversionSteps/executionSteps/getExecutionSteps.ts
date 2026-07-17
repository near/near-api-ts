import type { BaseDeserializeTransactionExecutionStepsFn } from '../../../../../../../../../types/_common/transactionDetails/deserializers';
import type { ExecutionSteps } from '../../../../../../../../../types/_common/transactionDetails/processingSteps/executionSteps/executionStep';
import { resultNatError } from '../../../../../../../../_common/natError';
import { result } from '../../../../../../../../_common/utils/result';
import type { ReceiptCreationMap } from '../createReceiptCreationMap';
import type { ReceiptsWithOutcomes } from '../getReceiptsWithOutcomes';
import { getParsedExecutionStep } from './getParsedExecutionStep';
import { getRawExecutionStep } from './getRawExecutionStep';

export const getExecutionSteps = (
  receiptsWithOutcomes: ReceiptsWithOutcomes,
  receiptCreationMap: ReceiptCreationMap,
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn,
) => {
  const rawExecutionSteps = receiptsWithOutcomes
    .filter(({ receipt }) => receipt.predecessorId !== 'system')
    .map(({ receipt, receiptOutcome }) =>
      getRawExecutionStep(receipt, receiptOutcome, receiptCreationMap),
    );

  // If a user wants to use his own custom deserializer:
  if (deserializeExecutionSteps) {
    try {
      return result.ok(deserializeExecutionSteps({ rawExecutionSteps }) as ExecutionSteps);
    } catch (cause) {
      return resultNatError('Client.GetTransactionResult.DeserializeExecutionSteps.Failed', {
        cause,
        rawExecutionSteps,
      });
    }
  }
  // If no custom deserializer is provided, use the default one and return default ExecutionSteps
  // with unknown result.data type and unknown functionCall.functionArgs type;
  return result.ok(rawExecutionSteps.map(getParsedExecutionStep) as ExecutionSteps);
};
