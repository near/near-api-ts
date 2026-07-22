import * as z from 'zod/mini';
import type { Base64String, Result, TransactionHash } from '../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
} from '../../../../../types/_common/transactionDetails/deserializers';
import type { TransactionProcessingStage } from '../../../../../types/_common/transactionDetails/processingStage';
import type { ExecutionFailureKind } from '../../../../../types/_common/transactionDetails/processingSteps/executionSteps/executionFailure';
import type { TransactionDetailsFromStage } from '../../../../../types/client/methods/transaction/sendSignedTransaction/output';
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
import { repackError } from '../../../../_common/utils/repackError';
import { getDetailsFromProcessingStage } from '../_common/getDetailsFromProcessingStage/getDetailsFromProcessingStage';

type RpcResult =
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
  minimalProcessingStage: TransactionProcessingStage,
  transactionHash: TransactionHash,
  signedTransactionBorsh64: Base64String,
  deserializeResultData?: BaseDeserializeTransactionResultDataFn,
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn,
  deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn,
): Result<
  TransactionDetailsFromStage[TransactionProcessingStage],
  | NatError<'Client.SendSignedTransaction.Exhausted'>
  | NatError<'Client.SendSignedTransaction.DeserializeResultData.Failed'>
  | NatError<'Client.SendSignedTransaction.DeserializeActionSummaries.Failed'>
  | NatError<'Client.SendSignedTransaction.DeserializeExecutionSteps.Failed'>
  | NatError<`Client.SendSignedTransaction.Rpc.${ExecutionFailureKind}`>
> => {
  const rpcResult = RpcResultZodSchema.safeParse(rpcResponse.result);

  if (!rpcResult.success)
    return resultNatError('Client.SendSignedTransaction.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcResult.error },
      }),
    });

  const details = getDetailsFromProcessingStage(
    {
      rpcResult: rpcResult.data,
      signedTransactionBorsh64,
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
        targetPrefix: 'Client.SendSignedTransaction',
      });
};
