import { RefetchBlockHashInterval } from '@common/configs/constants';
import type { SignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { State } from 'nat-types/signers/memorySigner/state';
import type { BlockHash } from 'nat-types/_common/common';

const fetchBlockHash = async (
  signerContext: SignerContext,
): Promise<BlockHash> => {
  const block = await signerContext.client.getBlock();
  return block.header.hash;
};

export const createState = async (
  signerContext: SignerContext,
): Promise<State> => {
  const blockHash = await fetchBlockHash(signerContext);

  const state = {
    blockHash,
  };

  const refetchBlockHashIntervalId = setInterval(async () => {
    state.blockHash = await fetchBlockHash(signerContext);
  }, RefetchBlockHashInterval);

  const clearIntervals = () => {
    clearInterval(refetchBlockHashIntervalId);
  };

  return {
    getBlockHash: () => state.blockHash,
    clearIntervals,
  };
};
