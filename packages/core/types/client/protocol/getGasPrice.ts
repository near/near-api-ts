import type { BlockId, NearToken } from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';

type GetGasPriceArgs = {
  blockId?: BlockId;
};

export type GetGasPriceResult = {
  gasPrice: NearToken;
};

export type GetGasPrice = (
  args?: GetGasPriceArgs,
) => Promise<GetGasPriceResult>;

export type CreateGetGasPrice = (clientContext: ClientContext) => GetGasPrice;
