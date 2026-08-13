import * as z from 'zod/mini';
import type { Result, TransactionHash } from '../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
} from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/deserializers';
import type { GetTransactionResultOutput } from '../../../../../types/client/methods/transaction/getTransactionResult';
import { createNatError, type NatError } from '../../../../_common/_common/_common/natError';
import { resultNatError } from '../../../../_common/_common/result';
import type { BaseRpcResponse } from '../../../_common/zodSchemas/baseRpcResponse';
import { finalExecutionStatusToProcessingStage } from '../_common/finalExecutionStatusToProcessingStage';
import { getConversionFailureCompletedFinal } from '../_common/getConversionFailure';
import { getExecutionFailureCompletedFinal } from '../_common/getExecutionFailure';
import { getExecutionSuccessCompletedFinal } from '../_common/getExecutionSuccess';
import { RpcFinalTransactionDetailsZodSchema } from '../_common/zodSchemas/rpcTransactionDetails';
import {
  isRpcTransactionOutcomeFailure,
  isRpcTransactionOutcomeSuccess,
} from '../_common/zodSchemas/rpcTransactionOutcome';

const RpcResultZodSchema = z.union([
  z.object({ finalExecutionStatus: z.literal('INCLUDED') }),
  z.object({ finalExecutionStatus: z.literal('INCLUDED_FINAL') }),
  z.object({ finalExecutionStatus: z.literal('EXECUTED_OPTIMISTIC') }),
  z.object({ finalExecutionStatus: z.literal('EXECUTED') }),
  RpcFinalTransactionDetailsZodSchema,
]);

export const handleRpcResult = (
  rpcResponse: BaseRpcResponse,
  transactionHash: TransactionHash,
  deserializeResultData?: BaseDeserializeTransactionResultDataFn,
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn,
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn,
): Result<
  GetTransactionResultOutput,
  | NatError<'Client.GetTransactionResult.Exhausted'>
  | NatError<'Client.GetTransactionResult.Rpc.Transaction.NotCompleted'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeResultData.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'>
  | NatError<'Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'>
> => {
  const rpcResult = RpcResultZodSchema.safeParse(rpcResponse.result);

  if (!rpcResult.success)
    return resultNatError('Client.GetTransactionResult.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcResult.error },
      }),
    });

  // #1: Check if the transaction is fully completed
  const { finalExecutionStatus } = rpcResult.data;

  if (finalExecutionStatus !== 'FINAL')
    return resultNatError('Client.GetTransactionResult.Rpc.Transaction.NotCompleted', {
      transactionHash,
      currentProcessingStage: finalExecutionStatusToProcessingStage(finalExecutionStatus),
    });

  const { transaction, transactionOutcome, status, receiptsOutcome, receipts } = rpcResult.data;

  // #2: When the transaction execution is successful;
  if ('SuccessValue' in status && isRpcTransactionOutcomeSuccess(transactionOutcome))
    return getExecutionSuccessCompletedFinal({
      transaction,
      transactionOutcomeSuccess: transactionOutcome,
      receipts,
      receiptsOutcome,
      statusSuccessValue: status.SuccessValue,
      deserializeResultData,
      deserializeActionSummaries,
      deserializeExecutionSteps,
    });

  // #3: When the transaction was converted into a receipt and included in the chunk
  // but failed during execution
  if (
    'Failure' in status &&
    'ActionError' in status.Failure &&
    isRpcTransactionOutcomeSuccess(transactionOutcome)
  )
    return getExecutionFailureCompletedFinal({
      transaction,
      transactionOutcomeSuccess: transactionOutcome,
      receipts,
      receiptsOutcome,
      actionError: status.Failure.ActionError,
      deserializeActionSummaries,
      deserializeExecutionSteps,
    });

  // #4: When the invalid transaction was included in the chunk because
  // chunk provider's bug or intent;
  // It's a theoretical case - normally RPC / chunk provider won't include it in mempool
  // and will return HandlerError;
  if (
    'Failure' in status &&
    'InvalidTxError' in status.Failure &&
    isRpcTransactionOutcomeFailure(transactionOutcome)
  )
    return getConversionFailureCompletedFinal({
      transaction,
      transactionOutcomeFailure: transactionOutcome,
      invalidTxError: status.Failure.InvalidTxError,
      deserializeActionSummaries,
    });

  // For TS only - we checked all possible cases
  throw new Error(`Unexpected data: ${JSON.stringify(rpcResult.data)}`);
};
