import type { ActionError } from '@near-js/jsonrpc-types';
import type { Result } from '../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
} from '../../../../../types/_common/transactionDetails/deserializers';
import type { TransactionExecutionFailure } from '../../../../../types/_common/transactionDetails/transactionResult';
import type { NatError } from '../../../../_common/natError';
import type { RpcActionReceipt } from '../../../../_common/schemas/zod/rpc/transactionDetails/receipt';
import type { RpcReceiptOutcome } from '../../../../_common/schemas/zod/rpc/transactionDetails/receiptOutcome';
import type { RpcTransactionOutcomeSuccess } from '../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import type { RpcTransactionSummary } from '../../../../_common/schemas/zod/rpc/transactionDetails/transactionSummary';
import { result } from '../../../../_common/utils/result';
import { getExecutionError } from './_common/_common/getExecutionError/getExecutionError';
import { getConversionStepSuccess } from './_common/getConversionStepSuccess';
import { getNonConversionSteps } from './_common/getNonConversionSteps/getNonConversionSteps';

export const getTransactionExecutionFailure = (
  transaction: RpcTransactionSummary,
  transactionOutcome: RpcTransactionOutcomeSuccess,
  receipts: RpcActionReceipt[],
  receiptsOutcome: RpcReceiptOutcome[],
  actionError: ActionError,
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn,
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn,
): Result<
  TransactionExecutionFailure,
  | NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>
> => {
  const conversionStepSuccess = getConversionStepSuccess(
    transaction,
    transactionOutcome,
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
