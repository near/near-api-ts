import type {
  BlockHeight,
  BlockHash,
  AccountId,
  BlockReference,
  Result,
} from '../../../_common/common';
import type { AccountAccessKey } from '../../../_common/accountAccessKey';
import type { ClientContext } from '../../client';
import type { PartialTransportPolicy } from '../../transport/transport';
import type { CommonRpcMethodErrorVariant } from '../_common/common';
import type { CommonRpcQueryMethodErrorVariant } from '../_common/query';
import type { NatError } from '../../../../src/_common/natError';
import type { RpcQueryAccessKeyListResult } from '../../../../src/client/methods/account/getAccountAccessKeys/handleResult';

export type GetAccountAccessKeysErrorVariant =
  | CommonRpcMethodErrorVariant<'Client.GetAccountAccessKeys'>
  | CommonRpcQueryMethodErrorVariant<'Client.GetAccountAccessKeys'>;

export type GetAccountAccessKeysInternalErrorKind =
  'Client.GetAccountAccessKeys.Internal';

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

export type GetAccountAccessKeysError =
  | NatError<'Client.GetAccountAccessKeys.Args.InvalidSchema'>
  | NatError<'Client.GetAccountAccessKeys.SendRequest.Failed'>
  // Rpc - query
  | NatError<'Client.GetAccountAccessKeys.Rpc.NotSynced'>
  | NatError<'Client.GetAccountAccessKeys.Rpc.Shard.NotTracked'>
  | NatError<'Client.GetAccountAccessKeys.Rpc.Block.GarbageCollected'>
  | NatError<'Client.GetAccountAccessKeys.Rpc.Block.NotFound'>
  // Stub
  | NatError<'Client.GetAccountAccessKeys.Internal'>;

export type SafeGetAccountAccessKeys = (
  args: GetAccountAccessKeysArgs,
) => Promise<Result<GetAccountAccessKeysOutput, GetAccountAccessKeysError>>;

export type GetAccountAccessKeys = (
  args: GetAccountAccessKeysArgs,
) => Promise<GetAccountAccessKeysOutput>;

export type CreateSafeGetAccountAccessKeys = (
  clientContext: ClientContext,
) => SafeGetAccountAccessKeys;
