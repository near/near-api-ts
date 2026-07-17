import type { Base64String, Result } from '../../../../../../../types/_common/common';
import type { TransactionSuccess } from '../../../../../../../types/_common/transactionDetails/transactionResult';
import type { InnerGetTransactionResultArgs } from '../../../../../../../types/client/methods/transaction/getTransactionResult';
import type { NatError } from '../../../../../../_common/natError';
import type { RpcActionReceipt } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { RpcTransactionOutcomeSuccess } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { repackError } from '../../../../../../_common/utils/repackError';
import { result } from '../../../../../../_common/utils/result';
import { getConversionStepSuccess } from '../../../_common/processingSteps/getConversionStepSuccess';
import { getNonConversionSteps } from '../_common/getNonConversionSteps/getNonConversionSteps';
import { getResultData } from './getResultData';

export const getTransactionSuccess = (
  transaction: RpcTransactionSummary,
  transactionOutcomeSuccess: RpcTransactionOutcomeSuccess,
  receipts: RpcActionReceipt[],
  receiptsOutcome: RpcReceiptOutcome[],
  statusSuccessValue: Base64String,
  inputArgs: InnerGetTransactionResultArgs,
): Result<
  TransactionSuccess<undefined, undefined, undefined>,
  | NatError<'Client.GetTransactionResult.DeserializeResultData.Failed'>
  | NatError<'Client.GetTransactionResult.DeserializeActionSummaries.Failed'>
  | NatError<'Client.GetTransactionResult.DeserializeExecutionSteps.Failed'>
> => {
  const conversionStepSuccess = getConversionStepSuccess(
    transaction,
    transactionOutcomeSuccess,
    inputArgs.options?.deserializeActionSummaries,
  );

  if (!conversionStepSuccess.ok)
    return repackError({
      error: conversionStepSuccess.error,
      originPrefix: 'Inner.Client.TransactionDetails',
      targetPrefix: 'Client.GetTransactionResult',
    });

  const nonConversionSteps = getNonConversionSteps(
    transaction,
    receipts,
    receiptsOutcome,
    conversionStepSuccess.value,
    inputArgs.options?.deserializeExecutionSteps,
  );
  if (!nonConversionSteps.ok) return nonConversionSteps;

  const resultData = getResultData(statusSuccessValue, inputArgs);
  if (!resultData.ok) return resultData;

  return result.ok({
    transactionHash: transaction.hash.cryptoHash,
    result: {
      status: 'Success',
      data: resultData.value,
    },
    processingSteps: {
      conversionStep: conversionStepSuccess.value,
      ...nonConversionSteps.value,
    },
  });
};
