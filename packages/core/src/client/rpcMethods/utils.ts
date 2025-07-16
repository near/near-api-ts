import type { BlockId } from '@near-api-ts/types';

/*
  User can pass BlockHeight as a string e.i '123455789'
  This format is invalid and RPC will throw an error if we will don't convert it
 */
const parseBlockId = (blockId: BlockId) => {
  const isInteger = /^[0-9]+$/.test(String(blockId));
  return isInteger ? Number(blockId) : blockId;
};

type getBlockTargetArgs = {
  // finality?: 'optimistic' | 'near-final' | 'final';
  finality?: string;
  blockId?: BlockId;
};

export const getBlockTarget = ({ finality, blockId }: getBlockTargetArgs = {}) => {
  if (blockId) return { block_id: parseBlockId(blockId) };
  return finality ? { finality } : { finality: 'near-final' };
};
