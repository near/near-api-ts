import type { CacheState, CreateCache } from '../../../types/client/cache/cache';
import { createGetStoragePricePerByte } from './getStoragePricePerByte';
import { createGetRecentBlockHash } from './getRecentBlockHash';

export const createCache: CreateCache = (args) => {
  const state: CacheState = {
    storagePricePerByte: { validUntil: 0 },
    recentBlockHash: { validUntil: 0 },
  };

  return {
    getStoragePricePerByte: createGetStoragePricePerByte(args.transport, state),
    getRecentBlockHash: createGetRecentBlockHash(args.transport, state),
  };
};
