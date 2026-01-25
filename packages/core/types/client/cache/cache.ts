import type { Transport } from 'nat-types/client/transport/transport';
import type { NearToken } from 'nat-types/_common/nearToken';
import type { Result } from 'nat-types/_common/common';

export type CacheState = {
  storagePricePerByte: {
    validUntil: number;
    value?: NearToken;
  };
};

export type GetStoragePricePerByte = () => Promise<Result<NearToken, any>>;

export type Cache = {
  getStoragePricePerByte: GetStoragePricePerByte;
};

export type CreateCacheArgs = {
  transport: Transport;
};

export type CreateCache = (args: CreateCacheArgs) => Cache;
