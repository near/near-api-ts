import type { BlockReference, BlockId } from 'nat-types/common';

const FinalityMap = {
  Optimistic: 'optimistic',
  NearFinal: 'near-final',
  Final: 'final',
} as const;

const SyncCheckpointMap = {
  Genesis: 'genesis',
  EarliestAvailable: 'earliest_available',
} as const;

export const toNativeBlockId = (blockId: BlockId) => ({
  block_id: typeof blockId === 'bigint' ? Number(blockId) : blockId,
});

export const toNativeBlockReference = (args?: BlockReference) => {
  if (typeof args === 'undefined') return { finality: FinalityMap.NearFinal };
  if ('finality' in args) return { finality: FinalityMap[args.finality] };
  if ('blockId' in args) return toNativeBlockId(args.blockId);
  if ('syncCheckpoint' in args)
    return { sync_checkpoint: SyncCheckpointMap[args.syncCheckpoint] };
};
