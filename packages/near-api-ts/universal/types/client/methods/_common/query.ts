import type { ShardId } from '@near-js/jsonrpc-types';
import type { BlockHash, BlockHeight } from '../../../_common/common';

export type CommonRpcQueryMethodErrorVariant<Prefix extends string> =
  | {
      kind: `${Prefix}.Rpc.NotSynced`; // TODO remove?
      context: null;
    }
  | {
      kind: `${Prefix}.Rpc.Shard.NotTracked`; // TODO remove?
      context: { shardId: ShardId };
    }
  | {
      kind: `${Prefix}.Rpc.Block.GarbageCollected`;
      context: {
        blockHash: BlockHash;
        blockHeight: BlockHeight;
      };
    }
  | {
      kind: `${Prefix}.Rpc.Block.NotFound`;
      context: {
        blockId: BlockHash | BlockHeight;
      };
    };
