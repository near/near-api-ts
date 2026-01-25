import type { CacheState, CreateCache } from 'nat-types/client/cache/cache';
import { createGetStoragePricePerByte } from './getStoragePricePerByte';

export const createCache: CreateCache = (args) => {
  const state: CacheState = {
    storagePricePerByte: { validUntil: 0 },
  };

  return {
    getStoragePricePerByte: createGetStoragePricePerByte(args.transport, state),
  };
};
