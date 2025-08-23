import { parseBlockId } from '../utils';
import { RpcGasPriceResponseSchema } from '@near-js/jsonrpc-types';
import type {
  CreateGetGasPrice,
  Output,
} from 'nat-types/client/rpcMethods/protocol/getGasPrice';

const responseTransformer = (result: any): Output => {
  const parsed = RpcGasPriceResponseSchema().parse(result);

  return {
    gasPrice: {
      yoctoNear: BigInt(parsed.gasPrice),
    },
  };
};

export const createGetGasPrice: CreateGetGasPrice =
  ({ sendRequest }) =>
  ({ options } = {}) =>
    sendRequest({
      body: {
        method: 'gas_price',
        params: [options?.blockId ? parseBlockId(options?.blockId) : null],
      },
      responseTransformer,
    });
