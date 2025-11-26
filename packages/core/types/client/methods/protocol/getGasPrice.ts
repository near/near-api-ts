import type { BlockId } from 'nat-types/_common/common';
import type { ClientContext } from 'nat-types/client/client';
import type { PartialTransportPolicy } from 'nat-types/client/transport';
import type {NearToken} from 'nat-types/_common/nearToken';

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
