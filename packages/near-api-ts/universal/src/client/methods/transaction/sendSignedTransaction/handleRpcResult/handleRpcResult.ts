import * as z from 'zod/mini';
import type { Base64String, Result, TransactionHash } from '../../../../../../types/_common/common';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
} from '../../../../../../types/_common/transactionDetails/_common/_common/deserializers';
import type { TransactionProcessingStage } from '../../../../../../types/_common/transactionDetails/_common/processingStage';
import type {
  ConversionFailureNatError,
  ExecutionFailureErrorAtStage,
} from '../../../../../../types/client/methods/transaction/sendSignedTransaction/error';
import type { TransactionDetailsFromStage } from '../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import { createNatError, type NatError, resultNatError } from '../../../../../_common/natError';
import type { BaseRpcResponse } from '../../../../../_common/schemas/zod/rpc/rpcResponse';
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
import { result } from '../../../../../_common/utils/result';
import {
  getDetailsFromProcessingStage,
  isInnerTransactionDetailsError,
} from './getDetailsFromProcessingStage/getDetailsFromProcessingStage';

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
  rpcResponse: BaseRpcResponse,
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
  | ConversionFailureNatError
  | ExecutionFailureErrorAtStage<'ExecutedOptimistic'>
  | ExecutionFailureErrorAtStage<'ExecutedNearlyFinal'>
  | ExecutionFailureErrorAtStage<'CompletedFinal'>
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

  if (details.ok) return details;

  // Narrowing `details.error` doesn't narrow `details` itself - `ResultErr<A | B>` is not
  // `ResultErr<A> | ResultErr<B>` - so the already public errors are rewrapped as is
  const { error } = details;

  return isInnerTransactionDetailsError(error)
    ? repackError({
        error,
        originPrefix: 'Inner.Client.TransactionDetails',
        targetPrefix: 'Client.SendSignedTransaction',
      })
    : result.err(error);
};
