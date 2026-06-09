import type { Result } from '../../../../../../../types/_common/common';
import type { TransactionResult } from '../../../../../../../types/_common/transactionDetails/transactionResult';
import type { InnerGetTransactionResultArgs } from '../../../../../../../types/client/methods/transaction/getTransactionResult';
import type { NatError } from '../../../../../../_common/natError';
import type { RpcFinalTransactionDetails } from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionDetails';
import {
  isRpcTransactionOutcomeFailure,
  isRpcTransactionOutcomeSuccess,
} from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import { result } from '../../../../../../_common/utils/result';
import { baseDeserializeResultData } from './baseDeserializeResultData';
import {
  getConversionStepError,
  getConversionStepSuccess,
} from './getProcessingSteps/getConversionStep';
import { getNonConversionSteps } from './getProcessingSteps/getNonConversionSteps/getNonConversionSteps';

export const getTransactionResultOutput = (
  rpcFinalTransactionDetails: RpcFinalTransactionDetails,
  inputArgs: InnerGetTransactionResultArgs,
): Result<
  TransactionResult,
  | NatError<'Client.GetTransactionResult.DeserializeResultData.Failed'>
  | NatError<'Client.GetTransactionResult.DeserializeActionSummaries.Failed'>
> => {
  const { transaction, transactionOutcome, status, receiptsOutcome, receipts } =
    rpcFinalTransactionDetails;

  // For some reason TypeScript can't figure out from Zod schema type that
  // when status = SuccessValue it means that transaction outcome is always SuccessReceiptId;
  // This is why we narrow the transactionOutcome type manually;

  // When the transaction execution is successful;
  if ('SuccessValue' in status && isRpcTransactionOutcomeSuccess(transactionOutcome)) {
    const conversionStepSuccess = getConversionStepSuccess(
      transaction,
      transactionOutcome,
      inputArgs,
    );
    if (!conversionStepSuccess.ok) return conversionStepSuccess;

    const { executionSteps, refundSteps } = getNonConversionSteps(
      transaction,
      receipts,
      receiptsOutcome,
      conversionStepSuccess.value,
    );

    const resultData = baseDeserializeResultData(inputArgs, status.SuccessValue);
    if (!resultData.ok) return resultData;

    return result.ok({
      transactionHash: transaction.hash.cryptoHash,
      result: {
        status: 'Success',
        data: resultData.value,
      },
      processingSteps: {
        conversionStep: conversionStepSuccess.value,
        executionSteps,
        refundSteps,
      },
    });
  }

  // When the transaction wasn't even converted into a receipt and included in the block
  if (
    'Failure' in status &&
    'InvalidTxError' in status.Failure &&
    isRpcTransactionOutcomeFailure(transactionOutcome)
  ) {
    const conversionStepError = getConversionStepError(transaction, transactionOutcome, inputArgs);
    if (!conversionStepError.ok) return conversionStepError;

    return result.ok({
      transactionHash: transaction.hash.cryptoHash,
      result: {
        status: 'ConversionError',
        error: {
          kind: 'any',
          context: status.Failure.InvalidTxError,
        },
      },
      processingSteps: {
        conversionStep: conversionStepError.value,
        executionSteps: null,
        refundSteps: null,
      },
    });
  }

  // When the transaction was converted into a receipt and included in the block
  // but failed during execution
  if (
    'Failure' in status &&
    'ActionError' in status.Failure &&
    isRpcTransactionOutcomeSuccess(transactionOutcome)
  ) {
    const conversionStepSuccess = getConversionStepSuccess(
      transaction,
      transactionOutcome,
      inputArgs,
    );
    if (!conversionStepSuccess.ok) return conversionStepSuccess;

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
        executionSteps: [],
        refundSteps: [],
      },
    });
  }

  // For TS only: we checked all possible cases
  throw new Error('Unreachable');
};
