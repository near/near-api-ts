import type { Result } from '../../../../../../../../../types/_common/common';
import type { ConversionStepSuccess } from '../../../../../../../../../types/_common/transactionDetails/processingSteps/conversionStep';
import type {
  ExecutionSteps,
  RawExecutionStep,
} from '../../../../../../../../../types/_common/transactionDetails/processingSteps/executionStep';
import type { RefundStep } from '../../../../../../../../../types/_common/transactionDetails/processingSteps/refundStep';
import type { InnerGetTransactionResultArgs } from '../../../../../../../../../types/client/methods/transaction/getTransactionResult';
import type { NatError } from '../../../../../../../../_common/natError';
import type { RpcActionReceipt } from '../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { RpcTransactionSummary } from '../../../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../../../../../_common/utils/result';
import { createReceiptCreationMap, type ReceiptCreationMap } from './createReceiptCreationMap';
import { deserializeExecutionSteps } from './deserializeExecutionSteps';
import { getRawExecutionStep } from './getExecutionSteps/getRawExecutionStep';
import { getReceiptsWithOutcomes, type ReceiptsWithOutcomes } from './getReceiptsWithOutcomes';
import { getRefundStep } from './getRefundStep';

const getRawExecutionSteps = (
  receiptsWithOutcomes: ReceiptsWithOutcomes,
  receiptCreationMap: ReceiptCreationMap,
): RawExecutionStep[] =>
  receiptsWithOutcomes
    .filter(({ receipt }) => receipt.predecessorId !== 'system')
    .map(({ receipt, receiptOutcome }) =>
      getRawExecutionStep(receipt, receiptOutcome, receiptCreationMap),
    );

const getRefundSteps = (
  receiptsWithOutcomes: ReceiptsWithOutcomes,
  receiptCreationMap: ReceiptCreationMap,
) =>
  receiptsWithOutcomes
    .filter(({ receipt }) => receipt.predecessorId === 'system')
    .map((receiptOutcome) =>
      getRefundStep(receiptOutcome.receipt, receiptOutcome.receiptOutcome, receiptCreationMap),
    );

type NonConversionSteps = { executionSteps: ExecutionSteps; refundSteps: RefundStep[] };

export const getNonConversionSteps = (
  transaction: RpcTransactionSummary,
  receipts: RpcActionReceipt[],
  receiptsOutcome: RpcReceiptOutcome[],
  conversionStepSuccess: ConversionStepSuccess,
  inputArgs: InnerGetTransactionResultArgs,
): Result<
  NonConversionSteps,
  NatError<'Client.GetTransactionResult.DeserializeExecutionSteps.Failed'>
> => {
  // To make sure we have at least one receipt outcome - theoretically it's possible that the
  // transaction just started and hasn't produced any receipts yet;
  // We still run the deserialization so a custom deserializer defines the executionSteps shape;
  if (receiptsOutcome.length === 0) {
    const executionSteps = deserializeExecutionSteps(inputArgs, []);
    if (!executionSteps.ok) return executionSteps;

    return result.ok({ executionSteps: executionSteps.value, refundSteps: [] });
  }

  const receiptsWithOutcomes = getReceiptsWithOutcomes(
    transaction,
    receipts,
    receiptsOutcome,
    conversionStepSuccess,
  );

  const receiptCreationMap = createReceiptCreationMap(conversionStepSuccess, receiptsWithOutcomes);

  const rawExecutionSteps = getRawExecutionSteps(receiptsWithOutcomes, receiptCreationMap);
  const executionSteps = deserializeExecutionSteps(inputArgs, rawExecutionSteps);
  if (!executionSteps.ok) return executionSteps;

  return result.ok({
    executionSteps: executionSteps.value,
    refundSteps: getRefundSteps(receiptsWithOutcomes, receiptCreationMap),
  });
};
