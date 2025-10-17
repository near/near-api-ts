import * as z from 'zod/mini';
import { base64 } from '@scure/base';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import {
  ViewStateResultSchema,
  CryptoHashSchema,
} from '@near-js/jsonrpc-types';
import type {
  CreateGetContractState,
  GetContractStateArgs,
  GetContractStateResult,
} from 'nat-types/client/methods/contract/getContractState';

const RpcQueryViewStateResponseSchema = z.object({
  ...ViewStateResultSchema().shape,
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

const transformResult = (
  result: unknown,
  args: GetContractStateArgs,
): GetContractStateResult => {
  const valid = RpcQueryViewStateResponseSchema.parse(result);

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
      method: 'query',
      params: {
        request_type: 'view_state',
        account_id: args.contractAccountId,
        prefix_base64: base64KeyPrefix,
        include_proof: args.includeProof,
        ...toNativeBlockReference(args.atMomentOf),
      },
      transportPolicy: args.policies?.transport,
      signal: args.options?.signal,
    });

    return transformResult(result, args);
  };
