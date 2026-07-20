import * as z from 'zod/mini';
import type { Result, TransactionHash } from '../../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
} from '../../../../../../types/_common/transactionDetails/deserializers';
import type { TransactionProcessingStage } from '../../../../../../types/_common/transactionDetails/processingStage';
import type { TransactionDetailsFromStage } from '../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import { createNatError, type NatError, resultNatError } from '../../../../../_common/natError';
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
import { repackError } from '../../../../../_common/utils/repackError';
import { getDetailsFromProcessingStage } from '../../_common/getDetailsFromProcessingStage/getDetailsFromProcessingStage';

export type RpcResult =
  | RpcIncludedTransactionDetails
  | RpcIncludedFinalTransactionDetails
  | RpcExecutedOptimisticTransactionDetails
  | RpcExecutedTransactionDetails
  | RpcFinalTransactionDetails;

export type TransactionDetailsHandlerContext = {
  rpcResult: RpcResult;
  transactionHash: TransactionHash;
  deserializeResultData?: BaseDeserializeTransactionResultDataFn;
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn;
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn;
};

const RpcResultZodSchema: z.ZodMiniType<RpcResult> = z.union([
  RpcIncludedTransactionDetailsZodSchema,
  RpcIncludedFinalTransactionDetailsZodSchema,
  RpcExecutedOptimisticTransactionDetailsZodSchema,
  RpcExecutedTransactionDetailsZodSchema,
  RpcFinalTransactionDetailsZodSchema,
]);

export const handleRpcResult = (
  rpcResponse: RpcResponse,
  minimalProcessingStage: TransactionProcessingStage,
  transactionHash: TransactionHash,
  deserializeResultData?: BaseDeserializeTransactionResultDataFn,
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn,
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn,
): Result<
  TransactionDetailsFromStage[TransactionProcessingStage],
  | NatError<'Client.GetTransactionResult.Exhausted'>
  | NatError<'Client.GetTransactionResult.DeserializeResultData.Failed'>
  | NatError<'Client.GetTransactionResult.DeserializeActionSummaries.Failed'>
  | NatError<'Client.GetTransactionResult.DeserializeExecutionSteps.Failed'>
> => {
  const rpcResult = RpcResultZodSchema.safeParse(rpcResponse.result);

  if (!rpcResult.success)
    return resultNatError('Client.GetTransactionResult.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcResult.error },
      }),
    });

  const details = getDetailsFromProcessingStage(
    {
      rpcResult: rpcResult.data,
      transactionHash,
      deserializeResultData,
      deserializeActionSummaries,
      deserializeExecutionSteps,
    },
    minimalProcessingStage,
  );

  return details.ok
    ? details
    : repackError({
        error: details.error,
        originPrefix: 'Inner.Client.TransactionDetails',
        targetPrefix: 'Client.GetTransactionResult',
      });
};
