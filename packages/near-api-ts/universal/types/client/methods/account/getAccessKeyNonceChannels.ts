import type { NatError } from '../../../../src/_common/_common/_common/_common/natError';
import type {
  AccountId,
  BlockHash,
  BlockHeight,
  BlockReference,
  Result,
  SequentialNonce,
} from '../../../_common/common';
import type { PublicKey, PublicKeyRef } from '../../../_common/crypto';
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

export interface GetAccessKeyNonceChannelsPublicErrorRegistry {
  'Client.GetAccessKeyNonceChannels.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.GetAccessKeyNonceChannels.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.GetAccessKeyNonceChannels.Timeout': TimeoutErrorContext;
  'Client.GetAccessKeyNonceChannels.Aborted': AbortedErrorContext;
  'Client.GetAccessKeyNonceChannels.Exhausted': ExhaustedErrorContext;
  /**
   * The account has no key with `replayProtection.scheme: 'NonceChannels'` under this public
   * key: there is no such account, no such key on it, or the key keeps a single nonce channel -
   * the node answers the same way to all three.
   */
  'Client.GetAccessKeyNonceChannels.Rpc.NonceChannels.NotFound': {
    accountId: AccountId;
    publicKey: PublicKey;
    atMomentOf: {
      blockHash: BlockHash;
      blockHeight: BlockHeight;
    };
  };
  'Client.GetAccessKeyNonceChannels.Rpc.NotSynced': RpcQueryNotSyncedErrorContext;
  'Client.GetAccessKeyNonceChannels.Rpc.Shard.NotTracked': RpcQueryShardNotTrackedErrorContext;
  'Client.GetAccessKeyNonceChannels.Rpc.Block.GarbageCollected': RpcQueryBlockGarbageCollectedErrorContext;
  'Client.GetAccessKeyNonceChannels.Rpc.Block.NotFound': RpcQueryBlockNotFoundErrorContext;
  'Client.GetAccessKeyNonceChannels.Internal': InternalErrorContext;
}

export type GetAccessKeyNonceChannelsArgs = {
  accountId: AccountId;
  publicKey: PublicKey;
  atMomentOf?: BlockReference;
  options?: {
    transportPolicy?: PartialTransportPolicy;
    signal?: AbortSignal;
  };
};

/**
 * One of the independent nonce channels of a key with `replayProtection.scheme: 'NonceChannels'`.
 * A transaction signed on this channel must use a nonce greater than `lastNonce`.
 */
export type NonceChannel = {
  /**
   * 0..`channelCount` - 1 of the key
   */
  channelId: number;
  lastNonce: SequentialNonce;
};

export type GetAccessKeyNonceChannelsOutput = {
  accountId: AccountId;
  publicKeyRef: PublicKeyRef;
  /**
   * Every channel of the key, in `channelId` order
   */
  nonceChannels: NonceChannel[];
  atMomentOf: {
    blockHash: BlockHash;
    blockHeight: BlockHeight;
  };
};

type GetAccessKeyNonceChannelsError =
  | NatError<'Client.GetAccessKeyNonceChannels.Args.InvalidSchema'>
  | NatError<'Client.GetAccessKeyNonceChannels.PreferredRpc.NotFound'>
  | NatError<'Client.GetAccessKeyNonceChannels.Timeout'>
  | NatError<'Client.GetAccessKeyNonceChannels.Aborted'>
  | NatError<'Client.GetAccessKeyNonceChannels.Exhausted'>
  // Rpc - query
  | NatError<'Client.GetAccessKeyNonceChannels.Rpc.NotSynced'>
  | NatError<'Client.GetAccessKeyNonceChannels.Rpc.Shard.NotTracked'>
  | NatError<'Client.GetAccessKeyNonceChannels.Rpc.Block.GarbageCollected'>
  | NatError<'Client.GetAccessKeyNonceChannels.Rpc.Block.NotFound'>
  | NatError<'Client.GetAccessKeyNonceChannels.Rpc.NonceChannels.NotFound'>
  // Stub
  | NatError<'Client.GetAccessKeyNonceChannels.Internal'>;

export type SafeGetAccessKeyNonceChannels = (
  args: GetAccessKeyNonceChannelsArgs,
) => Promise<Result<GetAccessKeyNonceChannelsOutput, GetAccessKeyNonceChannelsError>>;

export type GetAccessKeyNonceChannels = (
  args: GetAccessKeyNonceChannelsArgs,
) => Promise<GetAccessKeyNonceChannelsOutput>;

export type CreateSafeGetAccessKeyNonceChannels = (
  clientContext: ClientContext,
) => SafeGetAccessKeyNonceChannels;
