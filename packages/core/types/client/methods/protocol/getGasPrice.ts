import type { BlockId, NearToken } from 'nat-types/common';
import type { ClientContext } from 'nat-types/client/client';
import type { PartialTransportPolicy } from 'nat-types/client/transport';

export type GetGasPriceArgs = {
  atMomentOf?: 'LatestOptimisticBlock' | BlockId;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
};

export type GetGasPriceResult = {
  gasPrice: NearToken;
};

export type GetGasPrice = (
  args?: GetGasPriceArgs,
) => Promise<GetGasPriceResult>;

export type CreateGetGasPrice = (clientContext: ClientContext) => GetGasPrice;
