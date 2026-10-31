import * as z from 'zod/mini';
import type { CacheState, GetStoragePricePerByte } from '../../../types/client/cache/cache';
import type { Transport } from '../../../types/client/transport/transport';
import { createNatError } from '../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../_common/_common/_common/result';
import { yoctoNear } from '../../_common/nearToken';

const PartialProtocolConfigResultZodSchema = z.object({
  runtimeConfig: z.object({
    storageAmountPerByte: z.string(),
  }),
});

type FetchStoragePricePerByteArgs = {
  transport: Transport;
  state: CacheState;
  signal?: AbortSignal;
};

// We don't use getProtocolConfig method to avoid
// a situation, when user will use a CustomClient without this method, but it's
// required;
// Also, full protocol config shema may change a lot, and we want to avoid
// handling breaking changes all the time inside this fn.
// We use 'final', not 'near-final': while the head is still genesis, the near-final
// block is the zero hash the node doesn't know, and the final head starts at genesis.
const fetchStoragePricePerByte = async ({
  transport,
  state,
  signal,
}: FetchStoragePricePerByteArgs): ReturnType<GetStoragePricePerByte> => {
  const protocolConfig = await transport.sendRequest({
    method: 'EXPERIMENTAL_protocol_config',
    params: { finality: 'final' },
    signal,
  });
  if (!protocolConfig.success) return protocolConfig;

  const rpcResult = PartialProtocolConfigResultZodSchema.safeParse(protocolConfig.data.result);

  if (!rpcResult.success)
    return resultNatError('SendRequest.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcResult.error },
      }),
    });

  state.storagePricePerByte.value = yoctoNear(rpcResult.data.runtimeConfig.storageAmountPerByte);
  // Refetch every 1000ms * 60sec * 60min = 1 hour
  state.storagePricePerByte.validUntil = Date.now() + 3_600_000;

  return result.ok(state.storagePricePerByte.value);
};

export const createGetStoragePricePerByte =
  (transport: Transport, state: CacheState): GetStoragePricePerByte =>
  async (args) => {
    // 1. If the value is in the state already and still valid - return it
    if (
      !args?.refreshCache &&
      state.storagePricePerByte.value !== undefined &&
      state.storagePricePerByte.validUntil > Date.now()
    )
      return result.ok(state.storagePricePerByte.value);

    // 2. If the cache is empty (first call), expired or refreshed - fetch and set;
    // A call with its own signal fetches alone, so aborting it can't abort the others
    const signal = args?.signal;
    if (signal) return fetchStoragePricePerByte({ transport, state, signal });

    // The calls that come while the price is being fetched wait for the same request,
    // so a burst of getAccountInfo calls makes one request, not one each
    if (!state.storagePricePerByte.loadingPromise)
      state.storagePricePerByte.loadingPromise = fetchStoragePricePerByte({
        transport,
        state,
      }).finally(() => {
        state.storagePricePerByte.loadingPromise = undefined;
      });

    return state.storagePricePerByte.loadingPromise;
  };
