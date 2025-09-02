import type { BlockReference } from 'nat-types/common';

const FinalityMap = {
  Optimistic: 'optimistic',
  NearFinal: 'near-final',
  Final: 'final',
} as const;

const SyncCheckpointMap = {
  Genesis: 'genesis',
  EarliestAvailable: 'earliest_available',
} as const;

export const toNativeBlockReference = (args?: BlockReference) => {
  if (typeof args === 'undefined') return { finality: FinalityMap.NearFinal };
  if ('finality' in args) return { finality: FinalityMap[args.finality] };
  if ('blockId' in args) return { block_id: args.blockId };
  if ('syncCheckpoint' in args)
    return { sync_checkpoint: SyncCheckpointMap[args.syncCheckpoint] };
};
