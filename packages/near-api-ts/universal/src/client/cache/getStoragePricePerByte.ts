import * as z from 'zod/mini';
import { result } from '../../_common/utils/result';
import type {
  CacheState,
  GetStoragePricePerByte,
} from '../../../types/client/cache/cache';
import type { Transport } from '../../../types/client/transport/transport';
import { yoctoNear } from '../../../index';
import { createNatError } from '../../_common/natError';

const PartialProtocolConfigResultSchema = z.object({
  runtimeConfig: z.object({
    storageAmountPerByte: z.string(),
  }),
});

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

    // 2. If the cache is empty (first call) or is expired - fetch and set;
    // We don't use getProtocolConfig method to avoid
    // a situation, when user will use a CustomClient without this method, but it's
    // required;
    // Also, full protocol config shema may change a lot, and we want to avoid
    // handling breaking changes all the time inside this fn.
    const protocolConfig = await transport.sendRequest({
      method: 'EXPERIMENTAL_protocol_config',
      params: { finality: 'near-final' },
      signal: args?.signal,
    });
    if (!protocolConfig.ok) return protocolConfig;

    const rpcResult = PartialProtocolConfigResultSchema.safeParse(
      protocolConfig.value.result,
    );

    if (!rpcResult.success)
      return result.err(
        createNatError({
          kind: 'SendRequest.Exhausted',
          context: {
            lastError: createNatError({
              kind: 'SendRequest.Attempt.Response.InvalidSchema',
              context: { zodError: rpcResult.error },
            }),
          },
        }),
      );

    state.storagePricePerByte.value = yoctoNear(
      rpcResult.data.runtimeConfig.storageAmountPerByte,
    );
    // Refetch every 1000ms * 60sec * 60min = 1 hour
    state.storagePricePerByte.validUntil = Date.now() + 3_600_000;

    return result.ok(state.storagePricePerByte.value);
  };
