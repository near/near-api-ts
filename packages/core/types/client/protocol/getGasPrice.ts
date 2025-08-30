import type { BlockId, YoctoNearAmount } from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';

type GetGasPriceArgs = {
  blockId?: BlockId;
};

export type GetGasPriceResult = {
  gasPrice: YoctoNearAmount;
};

export type GetGasPrice = (
  args?: GetGasPriceArgs,
) => Promise<GetGasPriceResult>;

export type CreateGetGasPrice = (clientContext: ClientContext) => GetGasPrice;
