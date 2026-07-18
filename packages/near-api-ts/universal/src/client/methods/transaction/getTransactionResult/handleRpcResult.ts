import * as z from 'zod/mini';
import type { Result, TransactionHash } from '../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
} from '../../../../../types/_common/transactionDetails/deserializers';
import type { TransactionResult } from '../../../../../types/_common/transactionDetails/transactionResult';
import type { ExcludeStrict } from '../../../../../types/utils';
import { createNatError, type NatError, resultNatError } from '../../../../_common/natError';
import type { RpcResponse } from '../../../../_common/schemas/zod/rpc/rpc';
import {
  type RpcExecutedOptimisticTransactionDetails,
  RpcExecutedOptimisticTransactionDetailsZodSchema,
  type RpcExecutedTransactionDetails,
  RpcExecutedTransactionDetailsZodSchema,
  type RpcFinalTransactionDetails,
  RpcFinalTransactionDetailsZodSchema,
  type RpcIncludedFinalTransactionDetails,
  RpcIncludedFinalTransactionDetailsZodSchema,
  type RpcIncludedTransactionDetails,
  RpcIncludedTransactionDetailsZodSchema,
} from '../../../../_common/schemas/zod/rpc/transactionDetails/transactionDetails';
import {
  isRpcTransactionOutcomeFailure,
  isRpcTransactionOutcomeSuccess,
} from '../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import { getTransactionConversionFailure } from '../_common/getTransactionConversionFailure/getTransactionConversionFailure';
import { getTransactionExecutionFailure } from '../_common/getTransactionExecutionFailure';
import { getTransactionSuccess } from '../_common/getTransactionSuccess/getTransactionSuccess';

const getCurrentProcessingStage = (
  finalExecutionStatus: ExcludeStrict<RpcResult['finalExecutionStatus'], 'FINAL'>,
) => {
  if (finalExecutionStatus === 'INCLUDED') return 'ConvertedOptimistic';
  if (finalExecutionStatus === 'INCLUDED_FINAL') return 'ConvertedFinal';
  if (finalExecutionStatus === 'EXECUTED_OPTIMISTIC') return 'ExecutedOptimistic';
  return 'ExecutedNearlyFinal';
};

/**
 *  When we fetch tx_status with wait_until = NONE, we can't get a response with
 *  the finalExecutionStatus: 'NONE'. In nearcore it's only possible to get such status when such tx
 *  in on another shard. But at this moment sharded RPC in nearcore is not implemented,
 *  so we assume that all RPC will track all shards.
 */
export type RpcResult =
  | RpcIncludedTransactionDetails
  | RpcIncludedFinalTransactionDetails
  | RpcExecutedOptimisticTransactionDetails
  | RpcExecutedTransactionDetails
  | RpcFinalTransactionDetails;

const RpcResultZodSchema: z.ZodMiniType<RpcResult> = z.union([
  RpcIncludedTransactionDetailsZodSchema,
  RpcIncludedFinalTransactionDetailsZodSchema,
  RpcExecutedOptimisticTransactionDetailsZodSchema,
  RpcExecutedTransactionDetailsZodSchema,
  RpcFinalTransactionDetailsZodSchema,
]);

export const handleRpcResult = (
  rpcResponse: RpcResponse,
  transactionHash: TransactionHash,
  deserializeResultData?: BaseDeserializeTransactionResultDataFn,
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn,
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn,
): Result<
  TransactionResult,
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
      currentProcessingStage: getCurrentProcessingStage(finalExecutionStatus),
    });

  const { transaction, transactionOutcome, status, receiptsOutcome, receipts } = rpcResult.data;

  // #2: When the transaction execution is successful;
  if ('SuccessValue' in status && isRpcTransactionOutcomeSuccess(transactionOutcome))
    return getTransactionSuccess(
      transaction,
      transactionOutcome,
      receipts,
      receiptsOutcome,
      status.SuccessValue,
      deserializeResultData,
      deserializeActionSummaries,
      deserializeExecutionSteps,
    );

  // #3: When the transaction was converted into a receipt and included in the chunk
  // but failed during execution
  if (
    'Failure' in status &&
    'ActionError' in status.Failure &&
    isRpcTransactionOutcomeSuccess(transactionOutcome)
  )
    return getTransactionExecutionFailure(
      transaction,
      transactionOutcome,
      receipts,
      receiptsOutcome,
      status.Failure.ActionError,
      deserializeActionSummaries,
      deserializeExecutionSteps,
    );

  // #4: When the invalid transaction was included in the chunk because
  // chunk provider's bug or intent;
  // It's a theoretical case - normally RPC / chunk provider won't include it in mempool
  // and will return HandlerError;
  if (
    'Failure' in status &&
    'InvalidTxError' in status.Failure &&
    isRpcTransactionOutcomeFailure(transactionOutcome)
  )
    return getTransactionConversionFailure(
      transaction,
      transactionOutcome,
      status.Failure.InvalidTxError,
      deserializeActionSummaries,
    );

  // For TS only - we checked all possible cases
  throw new Error(`Unexpected data: ${JSON.stringify(rpcResult.data)}`);
};
