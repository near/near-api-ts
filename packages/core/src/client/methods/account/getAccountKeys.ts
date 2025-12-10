import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { AccessKeyListSchema, CryptoHashSchema } from '@near-js/jsonrpc-types';
import { transformAccessKey } from './helpers/transformAccessKey';
import type {
  CreateGetAccountKeys,
  GetAccountKeysArgs,
  GetAccountKeysResult,
} from 'nat-types/client/methods/account/getAccountKeys';

const RpcQueryAccessKeyListResponseSchema = z.object({
  ...AccessKeyListSchema().shape,
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

const transformResult = (
  result: unknown,
  args: GetAccountKeysArgs,
): GetAccountKeysResult => {
  const valid = RpcQueryAccessKeyListResponseSchema.parse(result);

  return {
    blockHash: valid.blockHash,
    blockHeight: valid.blockHeight,
    accountId: args.accountId,
    accountKeys: valid.keys.map(transformAccessKey),
  };
};

export const createGetAccountKeys: CreateGetAccountKeys =
  ({ sendRequest }) =>
  async (args) => {
    const result = await sendRequest({
      method: 'query',
      params: {
        request_type: 'view_access_key_list',
        account_id: args.accountId,
        ...toNativeBlockReference(args.atMomentOf),
      },
      transportPolicy: args.policies?.transport,
      signal: args.options?.signal,
    });

    return transformResult(result, args);
  };
