import type { BlockHash, Milliseconds, Result } from '../../_common/common';
import type { NearToken } from '../../_common/nearToken';
import type { SendRequestError } from '../transport/sendRequest';
import type { Transport } from '../transport/transport';
import type { SafeGetRecentBlockHash } from './getRecentBlockHash';

export type GetStoragePricePerByte = (args?: {
  refreshCache?: boolean;
  signal?: AbortSignal;
}) => Promise<Result<NearToken, SendRequestError>>;

export type CacheState = {
  storagePricePerByte: {
    validUntil: number;
    value?: NearToken;
    // The request that fetches the price right now, shared by the calls that come meanwhile
    loadingPromise?: ReturnType<GetStoragePricePerByte>;
  };
  recentBlockHash: {
    validUntil: number;
    value?: BlockHash;
    // The request that fetches the block right now, shared by the calls that come meanwhile
    loadingPromise?: ReturnType<SafeGetRecentBlockHash>;
  };
};

export type CacheOptions = {
  recentBlockHash?: {
    // How long a block hash is used before the client fetches a new one - an hour by default.
    // A network that keeps a transaction valid for less, as a localnet does, needs less
    ttlMs?: Milliseconds;
  };
};

export type Cache = {
  getStoragePricePerByte: GetStoragePricePerByte;
  getRecentBlockHash: SafeGetRecentBlockHash;
};

export type CreateCacheArgs = {
  transport: Transport;
  options?: CacheOptions;
};

export type CreateCache = (args: CreateCacheArgs) => Cache;
