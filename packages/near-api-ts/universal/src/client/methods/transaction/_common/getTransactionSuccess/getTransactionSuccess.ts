import type { Base64String, Result } from '../../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
} from '../../../../../../types/_common/transactionDetails/deserializers';
import type { TransactionSuccess } from '../../../../../../types/_common/transactionDetails/transactionResult';
import type { NatError } from '../../../../../_common/natError';
import type { RpcActionReceipt } from '../../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { RpcTransactionOutcomeSuccess } from '../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../../_common/utils/result';
import { getConversionStepSuccess } from '../_common/getConversionStepSuccess';
import { getNonConversionSteps } from '../_common/getNonConversionSteps/getNonConversionSteps';
import { getResultData } from './getResultData';

export const getTransactionSuccess = (
  transaction: RpcTransactionSummary,
  transactionOutcomeSuccess: RpcTransactionOutcomeSuccess,
  receipts: RpcActionReceipt[],
  receiptsOutcome: RpcReceiptOutcome[],
  statusSuccessValue: Base64String,
  deserializeResultData?: BaseDeserializeTransactionResultDataFn,
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn,
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn,
): Result<
  TransactionSuccess,
  | NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>
> => {
  const conversionStepSuccess = getConversionStepSuccess(
    transaction,
    transactionOutcomeSuccess,
    deserializeActionSummaries,
  );
  if (!conversionStepSuccess.ok) return conversionStepSuccess;

  const nonConversionSteps = getNonConversionSteps(
    transaction,
    receipts,
    receiptsOutcome,
    conversionStepSuccess.value,
    deserializeExecutionSteps,
  );
  if (!nonConversionSteps.ok) return nonConversionSteps;

  const resultData = getResultData(statusSuccessValue, deserializeResultData);
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
