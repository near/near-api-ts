import type { Result } from '../../../../../../../../types/_common/common';
import type { BaseDeserializeTransactionExecutionStepsFn } from '../../../../../../../../types/_common/transactionDetails/deserializers';
import type { ConversionStepSuccess } from '../../../../../../../../types/_common/transactionDetails/processingSteps/conversionStep';
import type { ExecutionSteps } from '../../../../../../../../types/_common/transactionDetails/processingSteps/executionSteps/executionStep';
import type { RefundStep } from '../../../../../../../../types/_common/transactionDetails/processingSteps/refundStep';
import type { NatError } from '../../../../../../../_common/natError';
import type { RpcActionReceipt } from '../../../../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { RpcTransactionSummary } from '../../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../../../../_common/utils/result';
import { createReceiptCreationMap } from './createReceiptCreationMap';
import { getExecutionSteps } from './getExecutionSteps/getExecutionSteps';
import { getReceiptsWithOutcomes } from './getReceiptsWithOutcomes';
import { getRefundSteps } from './getRefundSteps';

type NonConversionSteps = { executionSteps: ExecutionSteps; refundSteps: RefundStep[] };

export const getNonConversionSteps = (
  transaction: RpcTransactionSummary,
  receipts: RpcActionReceipt[],
  receiptsOutcome: RpcReceiptOutcome[],
  conversionStepSuccess: ConversionStepSuccess,
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn,
): Result<
  NonConversionSteps,
  NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>
> => {
  const receiptsWithOutcomes = getReceiptsWithOutcomes(
    transaction,
    receipts,
    receiptsOutcome,
    conversionStepSuccess,
  );

  const receiptCreationMap = createReceiptCreationMap(conversionStepSuccess, receiptsWithOutcomes);

  const executionSteps = getExecutionSteps(
    receiptsWithOutcomes,
    receiptCreationMap,
    deserializeExecutionSteps,
  );
  if (!executionSteps.ok) return executionSteps;

  return result.ok({
    executionSteps: executionSteps.value,
    refundSteps: getRefundSteps(receiptsWithOutcomes, receiptCreationMap),
  });
};
