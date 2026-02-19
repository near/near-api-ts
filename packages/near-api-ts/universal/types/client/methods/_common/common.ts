import type { ShardId } from '@near-js/jsonrpc-types';
import type { BlockHash, BlockHeight } from '@universal/types/_common/common';

export type RpcQueryNotSyncedErrorContext = null;
export type RpcQueryShardNotTrackedErrorContext = { shardId: ShardId };

export type RpcQueryBlockGarbageCollectedErrorContext = {
  blockHash: BlockHash;
  blockHeight: BlockHeight;
};

export type RpcQueryBlockNotFoundErrorContext = {
  blockId: BlockHash | BlockHeight;
};
