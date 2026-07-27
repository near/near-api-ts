import type { Result } from '../../../../../../../types/_common/common';
import type { BaseDeserializeTransactionExecutionStepsFn } from '../../../../../../../types/_common/transactionDetails/_common/_common/deserializers';
import type { ConversionStepSuccess } from '../../../../../../../types/_common/transactionDetails/_common/conversionStep';
import type { ExecutionSteps } from '../../../../../../../types/_common/transactionDetails/_common/executionStep';
import type { RefundStep } from '../../../../../../../types/_common/transactionDetails/_common/refundStep';
import type { NatError } from '../../../../../../_common/natError';
import type { RpcActionReceipt } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { RpcTransactionSummary } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../../../_common/utils/result';
import { createReceiptCreationMap } from './createReceiptCreationMap';
import { getExecutionSteps } from './getExecutionSteps/getExecutionSteps';
import { getReceiptsWithOutcomes } from './getReceiptsWithOutcomes';
import { getRefundSteps } from './getRefundSteps';

type NonConversionSteps = { executionSteps: ExecutionSteps; refundSteps: RefundStep[] };

type GetNonConversionStepsArgs = {
  transaction: RpcTransactionSummary;
  receipts: RpcActionReceipt[];
  receiptsOutcome: RpcReceiptOutcome[];
  conversionStepSuccess: ConversionStepSuccess;
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn;
};

export const getNonConversionSteps = (
  args: GetNonConversionStepsArgs,
): Result<
  NonConversionSteps,
  NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>
> => {
  const { conversionStepSuccess, deserializeExecutionSteps } = args;

  const receiptsWithOutcomes = getReceiptsWithOutcomes(args);
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
