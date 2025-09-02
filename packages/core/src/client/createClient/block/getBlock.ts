import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { RpcBlockResponseSchema } from '@near-js/jsonrpc-types';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import type {
  CreateGetBlock,
  GetBlockResult,
} from 'nat-types/client/block/getBlock';

const transformResult = (result: unknown): GetBlockResult => {
  const camelCased = snakeToCamelCase(result);
  return RpcBlockResponseSchema().parse(camelCased);
};

export const createGetBlock: CreateGetBlock =
  ({ sendRequest }) =>
  async (args) => {
    const result = await sendRequest({
      body: {
        method: 'block',
        params: toNativeBlockReference(args?.blockReference),
      },
    });
    return transformResult(result);
  };
