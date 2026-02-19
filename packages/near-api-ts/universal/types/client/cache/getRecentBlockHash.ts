import type { AbortedErrorContext, ExhaustedErrorContext, TimeoutErrorContext } from '@universal/types/client/transport/sendRequest';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '@universal/types/natError';
import type { NatError } from '../../../src/_common/natError';
import type { BlockHash, Result } from '../../_common/common';
import type { Transport } from '../transport/transport';
import type { CacheState } from './cache';

export interface GetRecentBlockHashPublicErrorRegistry {
  'Client.GetRecentBlockHash.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.GetRecentBlockHash.Timeout': TimeoutErrorContext;
  'Client.GetRecentBlockHash.Aborted': AbortedErrorContext;
  'Client.GetRecentBlockHash.Exhausted': ExhaustedErrorContext;
  'Client.GetRecentBlockHash.Internal': InternalErrorContext;
}

export type GetRecentBlockHashArgs = {
  options?: {
    refreshCache?: boolean;
    signal?: AbortSignal;
  };
};

type GetRecentBlockHashError =
  | NatError<'Client.GetRecentBlockHash.Args.InvalidSchema'>
  | NatError<'Client.GetRecentBlockHash.Timeout'>
  | NatError<'Client.GetRecentBlockHash.Aborted'>
  | NatError<'Client.GetRecentBlockHash.Exhausted'>
  | NatError<'Client.GetRecentBlockHash.Internal'>;

export type SafeGetRecentBlockHash = (
  args?: GetRecentBlockHashArgs,
) => Promise<Result<BlockHash, GetRecentBlockHashError>>;

export type GetRecentBlockHash = (
  args?: GetRecentBlockHashArgs,
) => Promise<BlockHash>;

export type CreateSafeGetRecentBlockHash = (
  transport: Transport,
  state: CacheState,
) => SafeGetRecentBlockHash;
