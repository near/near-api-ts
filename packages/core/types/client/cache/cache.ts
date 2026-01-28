import type { Transport } from 'nat-types/client/transport/transport';
import type { NearToken } from 'nat-types/_common/nearToken';
import type { Result } from 'nat-types/_common/common';
import type { SendRequestError } from 'nat-types/client/transport/sendRequest';

export type CacheState = {
  storagePricePerByte: {
    validUntil: number;
    value?: NearToken;
  };
};

export type GetStoragePricePerByte = () => Promise<
  Result<NearToken, SendRequestError>
>;

export type Cache = {
  getStoragePricePerByte: GetStoragePricePerByte;
};

export type CreateCacheArgs = {
  transport: Transport;
};

export type CreateCache = (args: CreateCacheArgs) => Cache;
