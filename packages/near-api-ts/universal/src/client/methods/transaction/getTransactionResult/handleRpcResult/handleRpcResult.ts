import * as z from 'zod/mini';
import type { InnerGetTransactionResultArgs } from '../../../../../../types/client/methods/transaction/getTransactionResult';
import type { ExcludeStrict } from '../../../../../../types/utils';
import { createNatError, resultNatError } from '../../../../../_common/natError';
import type { RpcResponse } from '../../../../../_common/schemas/zod/rpc/rpc';
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
} from '../../../../../_common/schemas/zod/rpc/transactionDetails/transactionDetails';
import {
  isRpcTransactionOutcomeFailure,
  isRpcTransactionOutcomeSuccess,
} from '../../../../../_common/schemas/zod/rpc/transactionDetails/transactionOutcome';
import { getTransactionConversionFailure } from './getTransactionConversionFailure';
import { getTransactionExecutionFailure } from './getTransactionExecutionFailure';
import { getTransactionSuccess } from './getTransactionSuccess';

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
  inputArgs: InnerGetTransactionResultArgs,
) => {
  const rpcResult = RpcResultZodSchema.safeParse(rpcResponse.result);

  if (!rpcResult.success)
    return resultNatError('Client.GetTransactionResult.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcResult.error },
      }),
    });

  // #1 Check if the transaction is fully completed
  const { finalExecutionStatus } = rpcResult.data;

  if (finalExecutionStatus !== 'FINAL')
    return resultNatError('Client.GetTransactionResult.Rpc.Transaction.NotCompleted', {
      transactionHash: inputArgs.transactionHash,
      currentProcessingStage: getCurrentProcessingStage(finalExecutionStatus),
    });

  // #2 Transform raw rpc result into NAT format
  const { transaction, transactionOutcome, status, receiptsOutcome, receipts } = rpcResult.data;

  // #2.1 When the transaction execution is successful;
  if ('SuccessValue' in status && isRpcTransactionOutcomeSuccess(transactionOutcome))
    return getTransactionSuccess(
      transaction,
      transactionOutcome,
      receipts,
      receiptsOutcome,
      status.SuccessValue,
      inputArgs,
    );

  // #2.2 When the transaction wasn't even converted into a receipt and included in the block
  if (
    'Failure' in status &&
    'InvalidTxError' in status.Failure &&
    isRpcTransactionOutcomeFailure(transactionOutcome)
  )
    return getTransactionConversionFailure(
      transaction,
      transactionOutcome,
      status.Failure.InvalidTxError,
      inputArgs,
    );

  // #2.3 When the transaction was converted into a receipt and included in the block
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
      inputArgs,
    );

  // For TS only - we checked all possible cases
  throw new Error('Unreachable');
};
