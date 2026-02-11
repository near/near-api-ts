import type { BlockId } from '../../../_common/common';
import type { ClientContext } from '../../client';
import type { PartialTransportPolicy } from '../../transport/transport';
import type {NearToken} from '../../../_common/nearToken';

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
