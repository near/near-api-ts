import type { Result } from '../../../../../../types/_common/common';
import type { TransactionExecutionError } from '../../../../../../types/_common/transactionDetails/transactionResult';
import type { InnerGetTransactionResultArgs } from '../../../../../../types/client/methods/transaction/getTransactionResult';
import type { NatError } from '../../../../../_common/natError';
import type { RpcActionReceipt } from '../../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { RpcTransactionOutcomeSuccess } from '../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../../_common/utils/result';
import { getConversionStepSuccess } from './_common/getProcessingSteps/getConversionStep';
import { getNonConversionSteps } from './_common/getProcessingSteps/getNonConversionSteps/getNonConversionSteps';

export const getTransactionExecutionError = (
  transaction: RpcTransactionSummary,
  transactionOutcome: RpcTransactionOutcomeSuccess,
  receipts: RpcActionReceipt[],
  receiptsOutcome: RpcReceiptOutcome[],
  status: any,
  inputArgs: InnerGetTransactionResultArgs,
): Result<
  TransactionExecutionError<undefined, undefined>,
  | NatError<'Client.GetTransactionResult.DeserializeResultData.Failed'>
  | NatError<'Client.GetTransactionResult.DeserializeActionSummaries.Failed'>
  | NatError<'Client.GetTransactionResult.DeserializeExecutionSteps.Failed'>
> => {
  const conversionStepSuccess = getConversionStepSuccess(
    transaction,
    transactionOutcome,
    inputArgs,
  );
  if (!conversionStepSuccess.ok) return conversionStepSuccess;

  const nonConversionSteps = getNonConversionSteps(
    transaction,
    receipts,
    receiptsOutcome,
    conversionStepSuccess.value,
    inputArgs,
  );
  if (!nonConversionSteps.ok) return nonConversionSteps;

  return result.ok({
    transactionHash: transaction.hash.cryptoHash,
    result: {
      status: 'ExecutionError',
      error: {
        kind: 'any',
        context: status.Failure.ActionError,
      },
    },
    processingSteps: {
      conversionStep: conversionStepSuccess.value,
      ...nonConversionSteps.value,
    },
  });
};
