import * as z from 'zod/mini';
import { RpcGasPriceResponseSchema } from '@near-js/jsonrpc-types';
import { toNativeBlockId } from '@common/transformers/toNative/blockReference';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import type {
  CreateGetGasPrice,
  GetGasPriceResult,
} from 'nat-types/client/protocol/getGasPrice';
import { BlockIdSchema } from '@common/schemas/zod/common';

const transformResult = (result: unknown): GetGasPriceResult => {
  const camelCased = snakeToCamelCase(result);
  const parsed = RpcGasPriceResponseSchema().parse(camelCased);

  return {
    gasPrice: {
      yoctoNear: BigInt(parsed.gasPrice),
    },
  };
};

const GetGasPriceArgsSchema = z.optional(
  z.object({
    blockId: z.optional(BlockIdSchema),
  }),
);

export const createGetGasPrice: CreateGetGasPrice =
  ({ sendRequest }) =>
  async (args) => {
    GetGasPriceArgsSchema.parse(args);

    const result = await sendRequest({
      body: {
        method: 'gas_price',
        params: {
          block_id: args?.blockId
            ? toNativeBlockId(args.blockId).block_id
            : null,
        },
      },
    });

    return transformResult(result);
  };
