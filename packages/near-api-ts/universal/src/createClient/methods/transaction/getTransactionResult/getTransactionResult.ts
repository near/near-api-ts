import * as z from 'zod/mini';
import type {
  CreateSafeGetTransactionResult,
  SafeGetTransactionResult,
} from '../../../../../types/client/methods/transaction/getTransactionResult';
import { resultNatError } from '../../../../_common/_common/_common/result';
import { wrapInternalError } from '../../../../_common/_common/wrapInternalError';
import { repackError } from '../../../../_common/repackError';
import { CryptoHashZodSchema } from '../../../../_common/zodSchemas/cryptoHash';
import { PartialTransportPolicyZodSchema } from '../../../_common/zodSchemas/transportPolicy';
import { handleRpcError } from './handleRpcError';
import { handleRpcResult } from './handleRpcResult';

const GetTransactionResultArgsZodShema = z.object({
  transactionHash: CryptoHashZodSchema,
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

export const createSafeGetTransactionResult: CreateSafeGetTransactionResult = (context) =>
  wrapInternalError('Client.GetTransactionResult.Internal', async (args) => {
    const validArgs = GetTransactionResultArgsZodShema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('Client.GetTransactionResult.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const rpcResponse = await context.sendRequest({
      method: 'EXPERIMENTAL_tx_status',
      params: {
        tx_hash: args.transactionHash,
        sender_account_id: 'any', // We expect that RPC tracks all shards, so signerAccountId doesn't matter
        wait_until: 'NONE',
      },
      transportPolicy: args.options?.transportPolicy,
      signal: args.options?.signal,
    });

    if (!rpcResponse.ok)
      return repackError({
        error: rpcResponse.error,
        originPrefix: 'SendRequest',
        targetPrefix: 'Client.GetTransactionResult',
      });

    if (rpcResponse.value.error) return handleRpcError(rpcResponse.value);

    const details = handleRpcResult(
      rpcResponse.value,
      args.transactionHash,
      args.options?.deserializeResultData,
      args.options?.deserializeActionSummaries,
      args.options?.deserializeExecutionSteps,
    );

    return details.ok
      ? details
      : repackError({
          error: details.error,
          originPrefix: 'Inner.Client.TransactionDetails',
          targetPrefix: 'Client.GetTransactionResult',
        });
  }) as SafeGetTransactionResult;
