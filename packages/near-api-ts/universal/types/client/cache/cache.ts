import type { Transport } from '../transport/transport';
import type { NearToken } from '../../_common/nearToken';
import type { BlockHash, Result } from '../../_common/common';
import type { SendRequestError } from '../transport/sendRequest';
import type { SafeGetRecentBlockHash } from './getRecentBlockHash';

export type GetStoragePricePerByte = (args?: {
  refreshCache?: boolean;
  signal?: AbortSignal;
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
