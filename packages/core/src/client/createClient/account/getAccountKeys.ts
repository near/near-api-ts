import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import { AccessKeyListSchema, CryptoHashSchema } from '@near-js/jsonrpc-types';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import { transformKey } from './helpers/transformKey';
import type {
  CreateGetAccountKeys,
  GetAccountKeysArgs,
  GetAccountKeysResult,
} from 'nat-types/client/account/getAccountKeys';

const RpcQueryAccessKeyListResponseSchema = z.object({
  ...AccessKeyListSchema().shape,
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

const transformResult = (
  result: unknown,
  args: GetAccountKeysArgs,
): GetAccountKeysResult => {
  const camelCased = snakeToCamelCase(result);
  const valid = RpcQueryAccessKeyListResponseSchema.parse(camelCased);

  return {
    blockHash: valid.blockHash,
    blockHeight: valid.blockHeight,
    accountId: args.accountId,
    accountKeys: valid.keys.map(transformKey),
  };
};

export const createGetAccountKeys: CreateGetAccountKeys =
  ({ sendRequest }) =>
  async (args) => {
    const result = await sendRequest({
      body: {
        method: 'query',
        params: {
          request_type: 'view_access_key_list',
          account_id: args.accountId,
          ...toNativeBlockReference(args.atMomentOf),
        },
      },
    });
    return transformResult(result, args);
  };
