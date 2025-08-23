import { parseBlockId } from '../utils';
import type { CreateGetGasPrice } from 'nat-types/client/rpcMethods/protocol/getGasPrice';

export const createGetGasPrice: CreateGetGasPrice =
  ({ sendRequest }) =>
  ({ options } = {}) =>
    sendRequest({
      body: {
        method: 'gas_price',
        params: [options?.blockId ? parseBlockId(options?.blockId) : null],
      },
    });
