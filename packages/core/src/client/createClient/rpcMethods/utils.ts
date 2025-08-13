import type { BlockTarget, BlockId } from 'nat-types/common';

/*
  User can pass BlockHeight as a string e.i '123455789'
  This format is invalid and RPC will throw an error if we will don't convert it
 */
// TODO replace with valibot schema
const parseBlockId = (blockId: BlockId) => {
  const isInteger = /^[0-9]+$/.test(String(blockId));
  return isInteger ? Number(blockId) : blockId; // TODO validate block hash
};

const finalityMap = {
  Optimistic: 'optimistic',
  NearFinal: 'near-final',
  Final: 'final',
} as const;

export const getBlockTarget = ({ finality, blockId }: BlockTarget = {}) => {
  if (blockId) return { block_id: parseBlockId(blockId) };
  return {
    finality: finality ? finalityMap[finality] : finalityMap.NearFinal,
  };
};
