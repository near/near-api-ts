import type {
  BlockHeight,
  BlockHash,
  AccountId,
  BlockReference,
  Result,
} from 'nat-types/_common/common';
import type { AccountAccessKey } from 'nat-types/_common/accountAccessKey';
import type { ClientContext } from 'nat-types/client/client';
import type { PartialTransportPolicy } from 'nat-types/client/transport/transport';
import type { SendRequestErrorVariant } from 'nat-types/client/transport/sendRequest';
import type { CommonRpcMethodErrorVariant } from 'nat-types/client/methods/_common/common';
import type { CommonRpcQueryMethodErrorVariant } from 'nat-types/client/methods/_common/query';
import type { NatError } from '@common/natError';
import type { RpcQueryAccessKeyListResult } from '../../../../src/client/methods/account/getAccountAccessKeys/handleResult';

export type GetAccountAccessKeysErrorVariant =
  | SendRequestErrorVariant<'Client.GetAccountAccessKeys'>
  | CommonRpcMethodErrorVariant<'Client.GetAccountAccessKeys'>
  | CommonRpcQueryMethodErrorVariant<'Client.GetAccountAccessKeys'>;

export type GetAccountAccessKeysUnknownErrorKind =
  'Client.GetAccountAccessKeys.Unknown';

export type GetAccountAccessKeysArgs = {
  accountId: AccountId;
  atMomentOf?: BlockReference;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
};

export type GetAccountAccessKeysOutput = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
  accountId: AccountId;
  accountAccessKeys: AccountAccessKey[];
  rawRpcResult: RpcQueryAccessKeyListResult;
};

type GetAccountAccessKeysError =
  // Function Arguments
  | NatError<'Client.GetAccountAccessKeys.Args.InvalidSchema'>
  // Transport
  | NatError<'Client.GetAccountAccessKeys.PreferredRpc.NotFound'>
  | NatError<'Client.GetAccountAccessKeys.Request.FetchFailed'>
  | NatError<'Client.GetAccountAccessKeys.Request.Attempt.Timeout'>
  | NatError<'Client.GetAccountAccessKeys.Request.Timeout'>
  | NatError<'Client.GetAccountAccessKeys.Request.Aborted'>
  | NatError<'Client.GetAccountAccessKeys.Response.JsonParseFailed'>
  | NatError<'Client.GetAccountAccessKeys.Response.InvalidSchema'>
  // Rpc - query - common
  | NatError<'Client.GetAccountAccessKeys.Rpc.NotSynced'>
  | NatError<'Client.GetAccountAccessKeys.Rpc.Shard.NotTracked'>
  | NatError<'Client.GetAccountAccessKeys.Rpc.Block.GarbageCollected'>
  | NatError<'Client.GetAccountAccessKeys.Rpc.Block.NotFound'>
  // Stub
  | NatError<'Client.GetAccountAccessKeys.Rpc.Internal'>
  | NatError<'Client.GetAccountAccessKeys.Unknown'>;

export type SafeGetAccountAccessKeys = (
  args: GetAccountAccessKeysArgs,
) => Promise<Result<GetAccountAccessKeysOutput, GetAccountAccessKeysError>>;

export type GetAccountAccessKeys = (
  args: GetAccountAccessKeysArgs,
) => Promise<GetAccountAccessKeysOutput>;

export type CreateSafeGetAccountAccessKeys = (
  clientContext: ClientContext,
) => SafeGetAccountAccessKeys;
