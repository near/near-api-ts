import * as z from 'zod/mini';
import type { CacheState } from '../../../types/client/cache/cache';
import type {
  CreateSafeGetRecentBlockHash,
  SafeGetRecentBlockHash,
} from '../../../types/client/cache/getRecentBlockHash';
import type { Transport } from '../../../types/client/transport/transport';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result } from '../../_common/_common/_common/result';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { repackError } from '../../_common/repackError';
import { CryptoHashZodSchema } from '../../_common/zodSchemas/cryptoHash';

const PartialBlockResultSchema = z.object({
  header: z.object({
    hash: CryptoHashZodSchema,
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

// We don't use the getBlock method to avoid
// a situation when a user will use a CustomClient without this method, but it's
// required;
// We use 'final', not 'near-final': while the head is still genesis, the near-final
// block is the zero hash the node doesn't know, and the final head starts at genesis.
// A final block is also never reverted, so the transaction stays on the canonical chain;
const fetchRecentBlockHash = async (
  transport: Transport,
  state: CacheState,
  signal?: AbortSignal,
): ReturnType<SafeGetRecentBlockHash> => {
  const rpcResponse = await transport.sendRequest({
    method: 'block',
    params: { finality: 'final' },
    signal,
  });

  // If the request failed
  if (!rpcResponse.success) {
    return repackError({
      error: rpcResponse.error,
      originPrefix: 'SendRequest',
      targetPrefix: 'Client.GetRecentBlockHash',
    });
  }

  // Check if RPC error
  if (rpcResponse.data.error)
    return result.err(
      createNatError({
        kind: 'Client.GetRecentBlockHash.Internal',
        context: { cause: rpcResponse.data },
      }),
    );

  // Check if a result is valid
  const rpcResult = PartialBlockResultSchema.safeParse(rpcResponse.data.result);

  if (!rpcResult.success)
    return result.err(
      createNatError({
        kind: 'Client.GetRecentBlockHash.Exhausted',
        context: {
          lastError: createNatError({
            kind: 'SendRequest.Attempt.Response.InvalidSchema',
            context: { zodError: rpcResult.error },
          }),
        },
      }),
    );

  state.recentBlockHash.value = rpcResult.data.header.hash.cryptoHash;
  // Refetch every 1000ms * 60sec * 60min = 1 hour
  state.recentBlockHash.validUntil = Date.now() + 3_600_000;

  return result.ok(state.recentBlockHash.value);
};

export const createGetRecentBlockHash: CreateSafeGetRecentBlockHash = (transport, state) =>
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

    // 3. If the cache is empty (first call), expired or refreshed - fetch and set;
    // A call with its own signal fetches alone, so aborting it can't abort the others
    const signal = args?.options?.signal;
    if (signal) return fetchRecentBlockHash(transport, state, signal);

    // The calls that come while the block is being fetched wait for the same request,
    // so a burst of transactions makes one request, not one each
    if (!state.recentBlockHash.loadingPromise)
      state.recentBlockHash.loadingPromise = fetchRecentBlockHash(transport, state).finally(() => {
        state.recentBlockHash.loadingPromise = undefined;
      });

    return state.recentBlockHash.loadingPromise;
  });
