import * as z from 'zod/mini';
import type { Result, TransactionHash } from '../../../../../../../types/_common/common';
import type { BaseDeserializeTransactionActionSummariesFn } from '../../../../../../../types/_common/transactionDetails/deserializers';
import type { SendSignedTransactionError } from '../../../../../../../types/client/methods/transaction/sendSignedTransaction/error';
import type { TransactionDetailsFromStageConvertedOptimistic } from '../../../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import { createNatError, resultNatError } from '../../../../../../_common/natError';
import type { RpcResponse } from '../../../../../../_common/schemas/zod/rpc/rpc';
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
} from '../../../../../../_common/schemas/zod/rpc/transactionDetails/transactionDetails';
import { getConvertedFinalDetails } from './_common/getConvertedFinalDetails';
import { getConvertedOptimisticDetails } from './_common/getConvertedOptimisticDetails';

export type RpcResultIncluded =
  | RpcIncludedTransactionDetails
  | RpcIncludedFinalTransactionDetails
  | RpcExecutedOptimisticTransactionDetails
  | RpcExecutedTransactionDetails
  | RpcFinalTransactionDetails;

const RpcResultIncludedZodSchema: z.ZodMiniType<RpcResultIncluded> = z.union([
  RpcIncludedTransactionDetailsZodSchema,
  RpcIncludedFinalTransactionDetailsZodSchema,
  RpcExecutedOptimisticTransactionDetailsZodSchema,
  RpcExecutedTransactionDetailsZodSchema,
  RpcFinalTransactionDetailsZodSchema,
]);

export const getDetailsFromStageConvertedOptimistic = (
  rpcResponse: RpcResponse,
  transactionHash: TransactionHash,
  deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn,
): Result<
  TransactionDetailsFromStageConvertedOptimistic<undefined, undefined, undefined>,
  SendSignedTransactionError
> => {
  const rpcResult = RpcResultIncludedZodSchema.safeParse(rpcResponse.result);

  if (!rpcResult.success)
    return resultNatError('Client.SendSignedTransaction.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcResult.error },
      }),
    });

  if (rpcResult.data.finalExecutionStatus === 'INCLUDED')
    return getConvertedOptimisticDetails(transactionHash);

  if (rpcResult.data.finalExecutionStatus === 'INCLUDED_FINAL')
    return getConvertedFinalDetails(rpcResult.data, transactionHash, deserializeActionSummaries);

  throw new Error('Unexpected finalExecutionStatus');
};
