import type { NatError } from '../../../../src/_common/_common/_common/_common/natError';
import type { AccessKey } from '../../../_common/accessKey';
import type {
  AccountId,
  BlockHash,
  BlockHeight,
  BlockReference,
  Result,
} from '../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../_common/natError';
import type { ClientContext } from '../../client';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '../../transport/sendRequest';
import type { PartialTransportPolicy } from '../../transport/transport';
import type {
  RpcQueryBlockGarbageCollectedErrorContext,
  RpcQueryBlockNotFoundErrorContext,
  RpcQueryNotSyncedErrorContext,
  RpcQueryShardNotTrackedErrorContext,
} from '../_common/common';

export interface GetAccessKeysPublicErrorRegistry {
  'Client.GetAccessKeys.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.GetAccessKeys.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.GetAccessKeys.Timeout': TimeoutErrorContext;
  'Client.GetAccessKeys.Aborted': AbortedErrorContext;
  'Client.GetAccessKeys.Exhausted': ExhaustedErrorContext;
  'Client.GetAccessKeys.Rpc.NotSynced': RpcQueryNotSyncedErrorContext;
  'Client.GetAccessKeys.Rpc.Shard.NotTracked': RpcQueryShardNotTrackedErrorContext;
  'Client.GetAccessKeys.Rpc.Block.GarbageCollected': RpcQueryBlockGarbageCollectedErrorContext;
  'Client.GetAccessKeys.Rpc.Block.NotFound': RpcQueryBlockNotFoundErrorContext;
  'Client.GetAccessKeys.Internal': InternalErrorContext;
}

export type GetAccessKeysArgs = {
  accountId: AccountId;
  atMomentOf?: BlockReference;
  options?: {
    transportPolicy?: PartialTransportPolicy;
    signal?: AbortSignal;
  };
};

export type GetAccessKeysOutput = {
  accountId: AccountId;
  accessKeys: AccessKey[];
  atMomentOf: {
    blockHash: BlockHash;
    blockHeight: BlockHeight;
  };
};

export type GetAccessKeysError =
  | NatError<'Client.GetAccessKeys.Args.InvalidSchema'>
  | NatError<'Client.GetAccessKeys.PreferredRpc.NotFound'>
  | NatError<'Client.GetAccessKeys.Timeout'>
  | NatError<'Client.GetAccessKeys.Aborted'>
  | NatError<'Client.GetAccessKeys.Exhausted'>
  // Rpc - query
  | NatError<'Client.GetAccessKeys.Rpc.NotSynced'>
  | NatError<'Client.GetAccessKeys.Rpc.Shard.NotTracked'>
  | NatError<'Client.GetAccessKeys.Rpc.Block.GarbageCollected'>
  | NatError<'Client.GetAccessKeys.Rpc.Block.NotFound'>
  // Stub
  | NatError<'Client.GetAccessKeys.Internal'>;

export type SafeGetAccessKeys = (
  args: GetAccessKeysArgs,
) => Promise<Result<GetAccessKeysOutput, GetAccessKeysError>>;

export type GetAccessKeys = (args: GetAccessKeysArgs) => Promise<GetAccessKeysOutput>;

export type CreateSafeGetAccessKeys = (clientContext: ClientContext) => SafeGetAccessKeys;
