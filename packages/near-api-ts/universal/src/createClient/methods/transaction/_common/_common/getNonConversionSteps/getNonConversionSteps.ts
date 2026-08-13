import type { Result } from '../../../../../../../types/_common/common';
import type { BaseDeserializeTransactionExecutionStepsFn } from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type { ConversionStepSuccess } from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/conversionStep';
import type { ExecutionSteps } from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/executionStep';
import type { RefundStep } from '../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/refundStep';
import type { NatError } from '../../../../../../_common/_common/_common/natError';
import { result } from '../../../../../../_common/_common/result';
import type { RpcActionReceipt } from '../../zodSchemas/rpcActionReceipt';
import type { RpcReceiptOutcome } from '../../zodSchemas/rpcReceiptOutcome';
import type { RpcTransactionSummary } from '../../zodSchemas/rpcTransactionSummary';
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
