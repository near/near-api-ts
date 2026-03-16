import type { BlockReference, NativeBlockReference } from '@universal/types/_common/common';

export const toNativeBlockReference = (blockReference?: BlockReference): NativeBlockReference => {
  if (blockReference === 'LatestOptimisticBlock') return { finality: 'optimistic' };
  if (blockReference === 'LatestNearFinalBlock') return { finality: 'near-final' };
  if (blockReference === 'LatestFinalBlock') return { finality: 'final' };
  if (blockReference === 'EarliestAvailableBlock') return { sync_checkpoint: 'earliest_available' };
  if (blockReference === 'GenesisBlock') return { sync_checkpoint: 'genesis' };

  if (blockReference && 'blockHash' in blockReference)
    return { block_id: blockReference.blockHash };

  if (blockReference && 'blockHeight' in blockReference)
    return { block_id: blockReference.blockHeight };

  return { finality: 'optimistic' };
};
