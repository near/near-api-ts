import type { Transport } from 'nat-types/client/transport/transport';
import type { NearToken } from 'nat-types/_common/nearToken';
import type { BlockHash, Result } from 'nat-types/_common/common';
import type { SendRequestError } from 'nat-types/client/transport/sendRequest';
import type { SafeGetRecentBlockHash } from 'nat-types/client/cache/getRecentBlockHash';

export type GetStoragePricePerByte = (args: {
  refreshCache: boolean;
  signal: AbortSignal;
}) => Promise<Result<NearToken, SendRequestError>>;

export type CacheState = {
  storagePricePerByte: {
    validUntil: number;
    value?: NearToken;
  };
  recentBlockHash: {
    validUntil: number;
    value?: BlockHash;
  };
};

export type Cache = {
  getStoragePricePerByte: GetStoragePricePerByte;
  getRecentBlockHash: SafeGetRecentBlockHash;
};

export type CreateCacheArgs = {
  transport: Transport;
};

export type CreateCache = (args: CreateCacheArgs) => Cache;
