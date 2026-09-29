import type { NatError } from '../../../../src/_common/_common/_common/_common/natError';
import type { AccessKey } from '../../../_common/accessKey';
import type {
  AccountId,
  BlockHash,
  BlockHeight,
  BlockReference,
  Result,
} from '../../../_common/common';
import type { PublicKey } from '../../../_common/crypto';
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

export interface GetAccessKeyPublicErrorRegistry {
  'Client.GetAccessKey.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.GetAccessKey.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.GetAccessKey.Timeout': TimeoutErrorContext;
  'Client.GetAccessKey.Aborted': AbortedErrorContext;
  'Client.GetAccessKey.Exhausted': ExhaustedErrorContext;
  'Client.GetAccessKey.Rpc.AccessKey.NotFound': {
    accountId: AccountId;
    publicKey: PublicKey;
    blockHash: BlockHash;
    blockHeight: BlockHeight;
  };
  'Client.GetAccessKey.Rpc.NotSynced': RpcQueryNotSyncedErrorContext;
  'Client.GetAccessKey.Rpc.Shard.NotTracked': RpcQueryShardNotTrackedErrorContext;
  'Client.GetAccessKey.Rpc.Block.GarbageCollected': RpcQueryBlockGarbageCollectedErrorContext;
  'Client.GetAccessKey.Rpc.Block.NotFound': RpcQueryBlockNotFoundErrorContext;
  'Client.GetAccessKey.Internal': InternalErrorContext;
}

export type GetAccessKeyArgs = {
  accountId: AccountId;
  publicKey: PublicKey;
  atMomentOf?: BlockReference;
  options?: {
    transportPolicy?: PartialTransportPolicy;
    signal?: AbortSignal;
  };
};

export type GetAccessKeyOutput = {
  accountId: AccountId;
  accessKey: AccessKey;
  atMomentOf: {
    blockHash: BlockHash;
    blockHeight: BlockHeight;
  };
};

type GetAccessKeyError =
  | NatError<'Client.GetAccessKey.Args.InvalidSchema'>
  | NatError<'Client.GetAccessKey.PreferredRpc.NotFound'>
  | NatError<'Client.GetAccessKey.Timeout'>
  | NatError<'Client.GetAccessKey.Aborted'>
  | NatError<'Client.GetAccessKey.Exhausted'>
  // Rpc - query
  | NatError<'Client.GetAccessKey.Rpc.NotSynced'>
  | NatError<'Client.GetAccessKey.Rpc.Shard.NotTracked'>
  | NatError<'Client.GetAccessKey.Rpc.Block.GarbageCollected'>
  | NatError<'Client.GetAccessKey.Rpc.Block.NotFound'>
  | NatError<'Client.GetAccessKey.Rpc.AccessKey.NotFound'>
  // Stub
  | NatError<'Client.GetAccessKey.Internal'>;

export type SafeGetAccessKey = (
  args: GetAccessKeyArgs,
) => Promise<Result<GetAccessKeyOutput, GetAccessKeyError>>;

export type GetAccessKey = (args: GetAccessKeyArgs) => Promise<GetAccessKeyOutput>;

export type CreateSafeGetAccessKey = (clientContext: ClientContext) => SafeGetAccessKey;
