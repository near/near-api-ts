import * as z from 'zod/mini';
import type { GetTransactionResultArgs } from '../../../../../../types/client/methods/transaction/getTransactionResult';
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
import { result } from '../../../../../_common/utils/result';
import { getTransactionResultOutput } from './getTransactionResultOutput/getTransactionResultOutput';

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

export const handleRpcResult = (rpcResponse: RpcResponse, inputArgs: GetTransactionResultArgs) => {
  const rpcResult = RpcResultZodSchema.safeParse(rpcResponse.result);

  if (!rpcResult.success)
    return resultNatError('Client.GetTransactionResult.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcResult.error },
      }),
    });

  // #1. Check if the transaction is fully completed
  const { finalExecutionStatus } = rpcResult.data;

  if (finalExecutionStatus !== 'FINAL')
    return resultNatError('Client.GetTransactionResult.Rpc.Transaction.NotCompleted', {
      transactionHash: inputArgs.transactionHash,
      currentProcessingStage: getCurrentProcessingStage(finalExecutionStatus),
    });

  // #2. Transform rpc data into NAT format
  return result.ok(getTransactionResultOutput(rpcResult.data));
};
