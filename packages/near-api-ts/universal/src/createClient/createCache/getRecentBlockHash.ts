import * as z from 'zod/mini';
import type { Milliseconds } from '../../../types/_common/common';
import type { CacheState } from '../../../types/client/cache/cache';
import type {
  CreateSafeGetRecentBlockHash,
  SafeGetRecentBlockHash,
} from '../../../types/client/cache/getRecentBlockHash';
import type { Transport } from '../../../types/client/transport/transport';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../_common/_common/_common/result';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { repackError } from '../../_common/repackError';
import { CryptoHashZodSchema } from '../../_common/zodSchemas/cryptoHash';

const PartialBlockResultZodSchema = z.object({
  header: z.object({
    hash: CryptoHashZodSchema,
  }),
});

const GetRecentBlockHashArgsZodSchema = z.optional(
  z.object({
    options: z.optional(
      z.object({
        refreshCache: z.optional(z.boolean()),
        signal: z.optional(z.instanceof(AbortSignal)),
      }),
    ),
  }),
);

type FetchRecentBlockHashArgs = {
  transport: Transport;
  state: CacheState;
  ttlMs: Milliseconds;
  signal?: AbortSignal;
};

// We don't use the getBlock method to avoid
// a situation when a user will use a CustomClient without this method, but it's
// required;
// We use 'final', not 'near-final': while the head is still genesis, the near-final
// block is the zero hash the node doesn't know, and the final head starts at genesis.
// A final block is also never reverted, so the transaction stays on the canonical chain;
const fetchRecentBlockHash = async ({
  transport,
  state,
  ttlMs,
  signal,
}: FetchRecentBlockHashArgs): ReturnType<SafeGetRecentBlockHash> => {
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
    return resultNatError('Client.GetRecentBlockHash.Internal', { cause: rpcResponse.data });

  // Check if a result is valid
  const rpcResult = PartialBlockResultZodSchema.safeParse(rpcResponse.data.result);

  if (!rpcResult.success)
    return resultNatError('Client.GetRecentBlockHash.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcResult.error },
      }),
    });

  state.recentBlockHash.value = rpcResult.data.header.hash.cryptoHash;
  state.recentBlockHash.validUntil = Date.now() + ttlMs;

  return result.ok(state.recentBlockHash.value);
};

export const createGetRecentBlockHash: CreateSafeGetRecentBlockHash = (transport, state, ttlMs) =>
  wrapInternalError('Client.GetRecentBlockHash.Internal', async (args) => {
    // 1. Validate arguments
    const validArgs = GetRecentBlockHashArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('Client.GetRecentBlockHash.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

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
    if (signal) return fetchRecentBlockHash({ transport, state, ttlMs, signal });

    // The calls that come while the block is being fetched wait for the same request,
    // so a burst of transactions makes one request, not one each
    if (!state.recentBlockHash.loadingPromise)
      state.recentBlockHash.loadingPromise = fetchRecentBlockHash({
        transport,
        state,
        ttlMs,
      }).finally(() => {
        state.recentBlockHash.loadingPromise = undefined;
      });

    return state.recentBlockHash.loadingPromise;
  });
