import type { BaseDeserializeTransactionExecutionStepsFn } from '../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type { ProtocolEra } from '../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/protocolEra';
import type { ExecutionSteps } from '../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/executionStep';
import { result, resultNatError } from '../../../../../../../_common/_common/_common/result';
import type { ReceiptsWithOutcomes } from '../../getReceiptsWithOutcomes';
import type { ReceiptCreationMap } from '../createReceiptCreationMap';
import { getParsedExecutionStep } from './getParsedExecutionStep';
import { getRawExecutionStep } from './getRawExecutionStep';

export const getExecutionSteps = <PE extends ProtocolEra>(
  receiptsWithOutcomes: ReceiptsWithOutcomes,
  receiptCreationMap: ReceiptCreationMap,
  protocolEras: PE[],
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn<PE>,
) => {
  const rawExecutionSteps = receiptsWithOutcomes
    .filter(({ receipt }) => receipt.predecessorId !== 'system')
    .map(({ receipt, receiptOutcome }) =>
      getRawExecutionStep(receipt, receiptOutcome, receiptCreationMap, protocolEras),
    );

  // If a user wants to use his own custom deserializer:
  if (deserializeExecutionSteps) {
    try {
      return result.ok(deserializeExecutionSteps({ rawExecutionSteps }) as ExecutionSteps<PE>);
    } catch (cause) {
      return resultNatError('Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed', {
        cause,
        rawExecutionSteps,
      });
    }
  }
  // If no custom deserializer is provided, use the default one and return default ExecutionSteps
  // with unknown result.data type and unknown callContractFunction.functionArgs type;
  return result.ok(rawExecutionSteps.map(getParsedExecutionStep) as ExecutionSteps<PE>);
};
