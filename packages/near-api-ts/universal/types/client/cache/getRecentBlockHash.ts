import type { BlockHash, Result } from '../../_common/common';
import type { SendRequestErrorVariant } from '../_common/sendRequestErrorVariant';
import type { NatError } from '../../../src/_common/natError';
import type { Transport } from '../transport/transport';
import type { CacheState } from './cache';
import type { CommonRpcMethodErrorVariant } from '../methods/_common/common';

export type GetRecentBlockHashErrorVariant =
  | CommonRpcMethodErrorVariant<'Client.GetRecentBlockHash'>
  | SendRequestErrorVariant<'Client.GetRecentBlockHash'>;

export type GetRecentBlockHashInternalErrorKind =
  'Client.GetRecentBlockHash.Internal';

export type GetRecentBlockHashArgs = {
  options?: {
    refreshCache?: boolean;
    signal?: AbortSignal;
  };
};

type GetRecentBlockHashError =
  | NatError<'Client.GetRecentBlockHash.Args.InvalidSchema'>
  | NatError<`Client.GetRecentBlockHash.PreferredRpc.NotFound`>
  | NatError<`Client.GetRecentBlockHash.Request.FetchFailed`>
  | NatError<`Client.GetRecentBlockHash.Request.Attempt.Timeout`>
  | NatError<`Client.GetRecentBlockHash.Request.Timeout`>
  | NatError<`Client.GetRecentBlockHash.Request.Aborted`>
  | NatError<`Client.GetRecentBlockHash.Response.JsonParseFailed`>
  | NatError<`Client.GetRecentBlockHash.Response.InvalidSchema`>
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
