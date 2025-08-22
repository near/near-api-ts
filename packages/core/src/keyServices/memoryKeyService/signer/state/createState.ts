import {
  RefetchBlockHashInterval,
  RefetchGasPriceInterval,
} from '@common/configs/constants';

const fetchBlockHash = async (signerContext: any) => {
  const block = await signerContext.client.getBlock();
  return block.header.hash;
};

const fetchGasPrice = async (signerContext: any) => {
  const { gasPrice } = await signerContext.client.getGasPrice();
  return BigInt(gasPrice); // TODO Fix after getGasPrice update
};

export const createState = async (signerContext: any) => {
  const [blockHash, gasPrice] = await Promise.all([
    fetchBlockHash(signerContext),
    fetchGasPrice(signerContext),
  ]);

  const state = {
    blockHash,
    gasPrice,
  };

  const refetchBlockHashIntervalId = setInterval(async () => {
    state.blockHash = await fetchBlockHash(signerContext);
  }, RefetchBlockHashInterval);

  const refetchGasPriceIntervalId = setInterval(async () => {
    state.gasPrice = await fetchGasPrice(signerContext);
  }, RefetchGasPriceInterval);

  const clearIntervals = () => {
    clearInterval(refetchBlockHashIntervalId);
    clearInterval(refetchGasPriceIntervalId);
  };

  return {
    getBlockHash: () => state.blockHash,
    getGasPrice: () => state.gasPrice,
    clearIntervals,
  };
};
