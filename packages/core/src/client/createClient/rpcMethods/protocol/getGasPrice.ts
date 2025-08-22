import { parseBlockId } from '../utils';
import type { BlockId } from 'nat-types/common';
import type { ClientMethodContext } from '../../createClient';
import type { RpcGasPriceResponse } from '@psalomo/jsonrpc-types';

type GetGasPriceInput = {
  options?: {
    blockId?: BlockId;
  };
};

export type GetGasPrice = (
  args?: GetGasPriceInput,
) => Promise<RpcGasPriceResponse>;

export const getGasPrice =
  ({ sendRequest }: ClientMethodContext): GetGasPrice =>
  ({ options } = {}) =>
    sendRequest({
      body: {
        method: 'gas_price',
        params: [options?.blockId ? parseBlockId(options?.blockId) : null],
      },
    });
