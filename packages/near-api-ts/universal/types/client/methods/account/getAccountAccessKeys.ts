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
import type {
  RpcQueryBlockGarbageCollectedErrorContext,
  RpcQueryBlockNotFoundErrorContext,
  RpcQueryNotSyncedErrorContext,
  RpcQueryShardNotTrackedErrorContext,
} from '../_common/common';
import type { NatError } from '../../../../src/_common/natError';
import type { RpcQueryAccessKeyListResult } from '../../../../src/client/methods/account/getAccountAccessKeys/handleResult';
import type {
  InternalErrorContext,
  InvalidSchemaErrorContext,
} from '@universal/types/natError';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '@universal/types/client/transport/sendRequest';

export interface GetAccountAccessKeysPublicErrorRegistry {
  'Client.GetAccountAccessKeys.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.GetAccountAccessKeys.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.GetAccountAccessKeys.Timeout': TimeoutErrorContext;
  'Client.GetAccountAccessKeys.Aborted': AbortedErrorContext;
  'Client.GetAccountAccessKeys.Exhausted': ExhaustedErrorContext;
  'Client.GetAccountAccessKeys.Rpc.NotSynced': RpcQueryNotSyncedErrorContext;
  'Client.GetAccountAccessKeys.Rpc.Shard.NotTracked': RpcQueryShardNotTrackedErrorContext;
  'Client.GetAccountAccessKeys.Rpc.Block.GarbageCollected': RpcQueryBlockGarbageCollectedErrorContext;
  'Client.GetAccountAccessKeys.Rpc.Block.NotFound': RpcQueryBlockNotFoundErrorContext;
  'Client.GetAccountAccessKeys.Internal': InternalErrorContext;
}

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
  | NatError<'Client.GetAccountAccessKeys.PreferredRpc.NotFound'>
  | NatError<'Client.GetAccountAccessKeys.Timeout'>
  | NatError<'Client.GetAccountAccessKeys.Aborted'>
  | NatError<'Client.GetAccountAccessKeys.Exhausted'>
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
