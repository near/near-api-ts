import type { CacheState, CreateCache } from '../../../types/client/cache/cache';
import { createGetRecentBlockHash } from './getRecentBlockHash';
import { createGetStoragePricePerByte } from './getStoragePricePerByte';

export const createCache: CreateCache = ({ transport, options }) => {
  const state: CacheState = {
    storagePricePerByte: { validUntil: 0 },
    recentBlockHash: { validUntil: 0 },
  };

  // Refetch every 1000ms * 60sec * 60min = 1 hour, unless the client is given its own ttl
  const recentBlockHashTtlMs = options?.recentBlockHash?.ttlMs ?? 3_600_000;

  return {
    getStoragePricePerByte: createGetStoragePricePerByte(transport, state),
    getRecentBlockHash: createGetRecentBlockHash(transport, state, recentBlockHashTtlMs),
  };
};
