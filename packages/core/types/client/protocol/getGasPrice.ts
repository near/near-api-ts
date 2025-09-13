import type { BlockId, NearToken } from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';

// TODO replace LatestBlock with a real block finality stage, i.e LatestFinalBlock
export type GetGasPriceArgs = {
  atMomentOf?: 'LatestBlock' | BlockId;
};

export type GetGasPriceResult = {
  gasPrice: NearToken;
};

export type GetGasPrice = (
  args?: GetGasPriceArgs,
) => Promise<GetGasPriceResult>;

export type CreateGetGasPrice = (clientContext: ClientContext) => GetGasPrice;
