import * as z from 'zod/mini';
import { result } from '@common/utils/result';
import type {
  CacheState,
  GetStoragePricePerByte,
} from 'nat-types/client/cache/cache';
import type { Transport } from 'nat-types/client/transport/transport';
import { yoctoNear } from '../../index';
import { createNatError } from '@common/natError';

const PartialProtocolConfigResultSchema = z.object({
  runtimeConfig: z.object({
    storageAmountPerByte: z.string(),
  }),
});

// TODO support abort?
export const createGetStoragePricePerByte =
  (transport: Transport, state: CacheState): GetStoragePricePerByte =>
  async () => {
    // 1. If value is in the state already and still valid - return it
    if (
      state.storagePricePerByte.value !== undefined &&
      state.storagePricePerByte.validUntil > Date.now()
    )
      return result.ok(state.storagePricePerByte.value);

    // 2. If the cache is empty (first call) or is expired - fetch and set;
    // We don't use getProtocolConfig method to avoid
    // a situation, when user will use a CustomClient without this method, but it's
    // required;
    // Also, full protocol config shema may change a lot, and we want to avoid
    // handling breaking changes all the time inside of this fn.
    const protocolConfig = await transport.sendRequest({
      method: 'EXPERIMENTAL_protocol_config',
      params: { finality: 'optimistic' },
    });
    if (!protocolConfig.ok) return protocolConfig;

    const rpcResult = PartialProtocolConfigResultSchema.safeParse(
      protocolConfig.value.result,
    );
    if (!rpcResult.success)
      return result.err(
        createNatError({
          kind: 'Client.Transport.SendRequest.Response.Result.InvalidSchema', // TODO change type
          context: { zodError: rpcResult.error },
        }),
      );

    state.storagePricePerByte.value = yoctoNear(
      rpcResult.data.runtimeConfig.storageAmountPerByte,
    );
    // Refetch every 1000ms * 60sec * 60min = 1 hour
    state.storagePricePerByte.validUntil = Date.now() + 3_600_000;

    return result.ok(state.storagePricePerByte.value);
  };
