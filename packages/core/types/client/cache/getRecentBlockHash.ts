import type { BlockHash, Result } from 'nat-types/_common/common';
import type { SendRequestErrorVariant } from 'nat-types/client/_common/sendRequestErrorVariant';
import type { NatError } from '@common/natError';
import type { Transport } from 'nat-types/client/transport/transport';
import type { CacheState } from 'nat-types/client/cache/cache';
import type { CommonRpcMethodErrorVariant } from 'nat-types/client/methods/_common/common';

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
