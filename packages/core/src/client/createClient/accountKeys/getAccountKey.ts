import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import type {
  CreateGetAccountKey,
  GetAccountKeyArgs,
} from 'nat-types/client/accountKeys/getAccountKey';
import type { GetAccountKeyResult } from 'nat-types/client/accountKeys/getAccountKey';
import { snakeToCamelCase } from '@common/utils/snakeToCamelCase';
import { AccessKeyViewSchema, CryptoHashSchema } from '@near-js/jsonrpc-types';
import { transformKey } from './helpers/transformKey';

const RpcQueryAccessKeyViewResponseSchema = z.object({
  ...AccessKeyViewSchema().shape,
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

const transformResult = (
  result: unknown,
  args: GetAccountKeyArgs,
): GetAccountKeyResult => {
  const camelCased = snakeToCamelCase(result);
  const parsed = RpcQueryAccessKeyViewResponseSchema.parse(camelCased);

  return {
    blockHash: parsed.blockHash,
    blockHeight: BigInt(parsed.blockHeight),
    accountKey: transformKey({
      accessKey: parsed,
      publicKey: args.publicKey,
    }),
  };
};

export const createGetAccountKey: CreateGetAccountKey =
  ({ sendRequest }) =>
  async (args) => {
    const result = await sendRequest({
      body: {
        method: 'query',
        params: {
          request_type: 'view_access_key',
          account_id: args.accountId,
          public_key: args.publicKey,
          ...toNativeBlockReference(args.blockReference),
        },
      },
    });
    return transformResult(result, args);
  };
