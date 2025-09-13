import * as z from 'zod/mini';
import { base64 } from '@scure/base';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import {
  ViewStateResultSchema,
  CryptoHashSchema,
} from '@near-js/jsonrpc-types';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import type {
  CreateGetContractState,
  GetContractStateArgs,
  GetContractStateResult,
} from 'nat-types/client/contract/getContractState';

const RpcQueryViewStateResponseSchema = z.object({
  ...ViewStateResultSchema().shape,
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

const transformResult = (
  result: unknown,
  args: GetContractStateArgs,
): GetContractStateResult => {
  const camelCased = snakeToCamelCase(result);
  const valid = RpcQueryViewStateResponseSchema.parse(camelCased);

  const final = {
    blockHash: valid.blockHash,
    blockHeight: valid.blockHeight,
    contractAccountId: args.contractAccountId,
    contractState: valid.values,
  } as GetContractStateResult;

  if (valid.proof) final.proof = valid.proof;

  return final;
};

export const createGetContractState: CreateGetContractState =
  ({ sendRequest }) =>
  async (args) => {
    const base64KeyPrefix = args.keyPrefix
      ? base64.encode(Uint8Array.from(args.keyPrefix))
      : '';

    const result = await sendRequest({
      body: {
        method: 'query',
        params: {
          request_type: 'view_state',
          account_id: args.contractAccountId,
          prefix_base64: base64KeyPrefix,
          include_proof: args.includeProof,
          ...toNativeBlockReference(args.atMomentOf),
        },
      },
    });
    return transformResult(result, args);
  };
