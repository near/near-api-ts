import { RefetchBlockHashInterval } from '@common/configs/constants';

const fetchBlockHash = async (signerContext: any) => {
  const block = await signerContext.client.getBlock();
  return block.header.hash;
};

export const createState = async (signerContext: any) => {
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
