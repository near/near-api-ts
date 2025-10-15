import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { RpcBlockResponseSchema } from '@near-js/jsonrpc-types';
import type {
  CreateGetBlock,
  GetBlockResult,
} from 'nat-types/client/methods/block/getBlock';

const transformResult = (result: unknown): GetBlockResult => {
  return RpcBlockResponseSchema().parse(result);
};

export const createGetBlock: CreateGetBlock =
  ({ sendRequest }) =>
  async (args) => {
    const result = await sendRequest({
      method: 'block',
      params: toNativeBlockReference(args?.blockReference),
    });
    return transformResult(result);
  };
