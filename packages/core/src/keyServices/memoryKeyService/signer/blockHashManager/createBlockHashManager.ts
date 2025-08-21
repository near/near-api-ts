import { RefetchBlockHashInterval } from '@common/configs/constants';

const fetchBlockHash = async (signerContext: any) => {
  const block = await signerContext.client.getBlock();
  return block.header.hash;
};

export const createBlockHashManager = async (signerContext: any) => {
  const state = {
    blockHash: await fetchBlockHash(signerContext),
  };

  const intervalId = setInterval(async () => {
    state.blockHash = await fetchBlockHash(signerContext);
  }, RefetchBlockHashInterval);

  return {
    getBlockHash: () => state.blockHash,
    stop: () => clearInterval(intervalId),
  };
};
