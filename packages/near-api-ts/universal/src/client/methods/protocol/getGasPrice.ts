import { RpcGasPriceResponseSchema } from '@near-js/jsonrpc-types';
import type { BlockHash, BlockHeight } from '@universal/types/_common/common';
import type { CreateGetGasPrice, GetGasPriceArgs, GetGasPriceResult } from '@universal/types/client/methods/protocol/getGasPrice';
import { throwableYoctoNear } from '../../../helpers/tokens/nearToken';

const transformResult = (result: unknown): GetGasPriceResult => {
  const valid = RpcGasPriceResponseSchema().parse(result);

  return {
    gasPrice: throwableYoctoNear(valid.gasPrice),
  };
};

// const GetGasPriceArgsSchema = z.optional(
//   z.object({
//     blockId: z.optional(BlockIdSchema), // TODO use atMomentOf?
//   }),
// );

const getBlockId = (
  atMomentOf?: GetGasPriceArgs['atMomentOf'],
): BlockHeight | BlockHash | null => {
  if (atMomentOf === 'LatestOptimisticBlock') return null;
  if (atMomentOf && 'blockHash' in atMomentOf) return atMomentOf.blockHash;
  if (atMomentOf && 'blockHeight' in atMomentOf) return atMomentOf.blockHeight;
  return null;
};

export const createGetGasPrice: CreateGetGasPrice =
  ({ sendRequest }) =>
  async (args) => {
    // GetGasPriceArgsSchema.parse(args);

    const result = await sendRequest({
      method: 'gas_price',
      params: {
        block_id: getBlockId(args?.atMomentOf),
      },
      transportPolicy: args?.policies?.transport,
      signal: args?.options?.signal,
    });

    return transformResult(result);
  };
