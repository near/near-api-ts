import type { ActionError } from '@near-js/jsonrpc-types';
import type { Result } from '../../../../../../types/_common/common';
import type { TransactionExecutionFailure } from '../../../../../../types/_common/transactionDetails/transactionResult';
import type { InnerGetTransactionResultArgs } from '../../../../../../types/client/methods/transaction/getTransactionResult';
import type { NatError } from '../../../../../_common/natError';
import type { RpcActionReceipt } from '../../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { RpcTransactionOutcomeSuccess } from '../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../../_common/utils/result';
import { getExecutionError } from './_common/getExecutionError/getExecutionError';
import { getConversionStepSuccess } from './_common/getProcessingSteps/getConversionStep';
import { getNonConversionSteps } from './_common/getProcessingSteps/getNonConversionSteps/getNonConversionSteps';

export const getTransactionExecutionFailure = (
  transaction: RpcTransactionSummary,
  transactionOutcome: RpcTransactionOutcomeSuccess,
  receipts: RpcActionReceipt[],
  receiptsOutcome: RpcReceiptOutcome[],
  actionError: ActionError,
  inputArgs: InnerGetTransactionResultArgs,
): Result<
  TransactionExecutionFailure<undefined, undefined>,
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
      error: getExecutionError(actionError),
    },
    processingSteps: {
      conversionStep: conversionStepSuccess.value,
      ...nonConversionSteps.value,
    },
  });
};
