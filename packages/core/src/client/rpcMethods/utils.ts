import type { BlockId, Finality } from '@near-api-ts/types';

type GetBlockTargetArgs = {
  finality?: Finality;
  blockId?: BlockId;
};

/*
  User can pass BlockHeight as a string e.i '123455789'
  This format is invalid and RPC will throw an error if we will don't convert it
 */
const parseBlockId = (blockId: BlockId) => {
  const isInteger = /^[0-9]+$/.test(String(blockId));
  return isInteger ? Number(blockId) : blockId; // TODO validate block hash
};

const finalityMap = {
  OPTIMISTIC: 'optimistic',
  NEAR_FINAL: 'near-final',
  FINAL: 'final',
};

export const getBlockTarget = ({
  finality,
  blockId,
}: GetBlockTargetArgs = {}) => {
  if (blockId) return { block_id: parseBlockId(blockId) };
  return finality
    ? { finality: finalityMap[finality] }
    : { finality: finalityMap.NEAR_FINAL };
};
