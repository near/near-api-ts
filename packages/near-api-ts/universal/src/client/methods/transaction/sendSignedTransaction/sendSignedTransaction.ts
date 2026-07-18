import * as z from 'zod/mini';
import { log } from '../../../../../tests/utils/common';
import type {
  CreateSafeSendSignedTransaction,
  SafeSendSignedTransaction,
} from '../../../../../types/client/methods/transaction/sendSignedTransaction/sendSignedTransaction';
import { resultNatError } from '../../../../_common/natError';
import { CryptoHashZodSchema } from '../../../../_common/schemas/zod/common/cryptoHash';
import {
  processingStageToWaitUntil,
  withDefaultProcessingStage,
} from '../../../../_common/transformers/toNative/processingStage';
import { repackError } from '../../../../_common/utils/repackError';
import { wrapInternalError } from '../../../../_common/utils/wrapInternalError';
import { PartialTransportPolicyZodSchema } from '../../../transport/transportPolicy';
import { handleRpcError } from './handleRpcError/handleRpcError';
import { handleRpcResult } from './handleRpcResult/handleRpcResult';

const SendSignedTransactionArgsShema = z.object({
  signedTransaction: z.object({
    signedTransactionBorsh64: z.base64(),
    transactionHash: CryptoHashZodSchema,
  }),
  minimalProcessingStage: z.optional(
    z.union([
      z.literal('ConvertedOptimistic'),
      z.literal('ConvertedFinal'),
      z.literal('ExecutedOptimistic'),
      z.literal('ExecutedNearlyFinal'),
      z.literal('CompletedFinal'),
    ]),
  ),
  options: z.optional(
    z.object({
      transportPolicy: PartialTransportPolicyZodSchema,
      signal: z.optional(z.instanceof(AbortSignal)),
      deserializeResultData: z.optional(z.instanceof(Function)),
      deserializeActionSummaries: z.optional(z.instanceof(Function)),
      deserializeExecutionSteps: z.optional(z.instanceof(Function)),
    }),
  ),
});

export const createSafeSendSignedTransaction: CreateSafeSendSignedTransaction = (context) =>
  wrapInternalError('Client.SendSignedTransaction.Internal', async (args) => {
    const validArgs = SendSignedTransactionArgsShema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('Client.SendSignedTransaction.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const minimalProcessingStage = withDefaultProcessingStage(args.minimalProcessingStage);

    const rpcResponse = await context.sendRequest({
      method: 'send_tx',
      params: {
        signed_tx_base64: args.signedTransaction.signedTransactionBorsh64,
        wait_until: processingStageToWaitUntil(minimalProcessingStage),
      },
      transportPolicy: args.options?.transportPolicy,
      signal: args.options?.signal,
    });

    log(rpcResponse)

    if (!rpcResponse.ok)
      return repackError({
        error: rpcResponse.error,
        originPrefix: 'SendRequest',
        targetPrefix: 'Client.SendSignedTransaction',
      });

    return rpcResponse.value.error
      ? handleRpcError(rpcResponse.value)
      : handleRpcResult(
          rpcResponse.value,
          minimalProcessingStage,
          args.signedTransaction.transactionHash,
          args.options?.deserializeResultData,
          args.options?.deserializeActionSummaries,
          args.options?.deserializeExecutionSteps,
        );
  }) as SafeSendSignedTransaction;
