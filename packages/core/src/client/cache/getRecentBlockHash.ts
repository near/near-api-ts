import * as z from 'zod/mini';
import { result } from '@common/utils/result';
import { createNatError, isNatErrorOf } from '@common/natError';
import { BlockHashSchema } from '@common/schemas/zod/common/common';
import type { CreateSafeGetRecentBlockHash } from 'nat-types/client/cache/getRecentBlockHash';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import { repackError } from '@common/utils/repackError';

const PartialBlockResultSchema = z.object({
  header: z.object({
    hash: BlockHashSchema,
  }),
});

const GetRecentBlockHashArgsSchema = z.optional(
  z.object({
    options: z.optional(
      z.object({
        refreshCache: z.optional(z.boolean()),
        signal: z.optional(z.instanceof(AbortSignal)),
      }),
    ),
  }),
);

export const createGetRecentBlockHash: CreateSafeGetRecentBlockHash = (
  transport,
  state,
) =>
  wrapInternalError('Client.GetRecentBlockHash.Internal', async (args) => {
    // 1. Validate arguments
    const validArgs = GetRecentBlockHashArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'Client.GetRecentBlockHash.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    // 2. If the value is in the state already and still valid - return it
    if (
      !args?.options?.refreshCache &&
      state.recentBlockHash.value !== undefined &&
      state.recentBlockHash.validUntil > Date.now()
    )
      return result.ok(state.recentBlockHash.value);

    // 3. If the cache is empty (first call) or is expired - fetch and set;
    // We don't use the getBlock method to avoid
    // a situation when a user will use a CustomClient without this method, but it's
    // required;
    const rpcResponse = await transport.sendRequest({
      method: 'block',
      params: { finality: 'near-final' },
      signal: args?.options?.signal,
    });

    // If the request failed
    if (!rpcResponse.ok) {
      if (
        isNatErrorOf(rpcResponse.error, [
          'Client.Transport.SendRequest.Response.Result.InvalidSchema',
          'Client.Transport.SendRequest.Response.Error.InvalidSchema',
        ])
      )
        // TODO remove after fix sendRequest error types (remove Result.InvalidSchema + Error.InvalidSchema)
        throw rpcResponse.error;

      return repackError({
        error: rpcResponse.error,
        originPrefix: 'Client.Transport.SendRequest',
        targetPrefix: 'Client.GetRecentBlockHash',
      });
    }

    // Check if RPC error
    if (rpcResponse.value.error)
      return result.err(
        createNatError({
          kind: 'Client.GetRecentBlockHash.Internal',
          context: {
            cause: createNatError({
              kind: 'Client.GetRecentBlockHash.Rpc.Unclassified',
              context: { rpcResponse: rpcResponse.value },
            }),
          },
        }),
      );

    // Check if a result is valid
    const rpcResult = PartialBlockResultSchema.safeParse(
      rpcResponse.value.result,
    );

    if (!rpcResult.success)
      return result.err(
        createNatError({
          kind: 'Client.GetRecentBlockHash.Response.InvalidSchema',
          context: { zodError: rpcResult.error },
        }),
      );

    state.recentBlockHash.value = rpcResult.data.header.hash.cryptoHash;
    // Refetch every 1000ms * 60sec * 60min = 1 hour
    state.recentBlockHash.validUntil = Date.now() + 3_600_000;

    return result.ok(state.recentBlockHash.value);
  });
