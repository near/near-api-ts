import type { Result } from '../../../../../../../types/_common/common';
import type { BaseDeserializeTransactionExecutionStepsFn } from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type { ProtocolEra } from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/protocolEra';
import type { ConversionStepSuccess } from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/conversionStep';
import type { ExecutionSteps } from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/executionStep';
import type { RefundStep } from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/refundStep';
import type { NatError } from '../../../../../../_common/_common/_common/_common/natError';
import { result } from '../../../../../../_common/_common/_common/result';
import {
  getReceiptsWithOutcomes,
  type ReceiptsWithOutcomes,
} from '../_common/getReceiptsWithOutcomes';
import { createReceiptCreationMap } from './createReceiptCreationMap';
import { getExecutionSteps } from './getExecutionSteps/getExecutionSteps';
import { getRefundSteps } from './getRefundSteps';

type NonConversionSteps<PE extends ProtocolEra> = {
  executionSteps: ExecutionSteps<PE>;
  refundSteps: RefundStep[];
};

type GetNonConversionStepsArgs<PE extends ProtocolEra> = {
  receiptsWithOutcomes: ReceiptsWithOutcomes;
  conversionStepSuccess: ConversionStepSuccess<PE>;
  protocolEras: PE[];
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn<PE>;
};

export const getNonConversionSteps = <PE extends ProtocolEra>(
  args: GetNonConversionStepsArgs<PE>,
): Result<
  NonConversionSteps<PE>,
  NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>
> => {
  const { conversionStepSuccess, protocolEras, deserializeExecutionSteps, receiptsWithOutcomes } =
    args;

  const receiptCreationMap = createReceiptCreationMap(conversionStepSuccess, receiptsWithOutcomes);

  const executionSteps = getExecutionSteps(
    receiptsWithOutcomes,
    receiptCreationMap,
    protocolEras,
    deserializeExecutionSteps,
  );
  if (!executionSteps.success) return executionSteps;

  return result.ok({
    executionSteps: executionSteps.data,
    refundSteps: getRefundSteps(receiptsWithOutcomes, receiptCreationMap),
  });
};
