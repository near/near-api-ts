export const createBlockHashManager = async (signerContext: any) => {
  const block = await signerContext.client.getBlock();

  const state = {
    blockHash: block.header.hash,
  };

  return {
    getBlockHash: () => state.blockHash,
  };
};
