import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import type {
  CreateGetAccountKey,
  GetAccountKeyArgs,
} from 'nat-types/client/methods/account/getAccountKey';
import type { GetAccountKeyResult } from 'nat-types/client/methods/account/getAccountKey';
import { AccessKeyViewSchema, CryptoHashSchema } from '@near-js/jsonrpc-types';
import { transformKey } from './helpers/transformKey';
import { NatError } from '../../transport/transportError';

const BaseSchema = z.object({
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

const RpcQueryAccessKeyViewResponseSchema = z.union([
  z.object({
    ...BaseSchema.shape,
    ...AccessKeyViewSchema().shape,
  }),
  z.object({
    ...BaseSchema.shape,
    error: z.string(),
    logs: z.array(z.string()),
  }),
]);

const transformResult = (
  result: unknown,
  args: GetAccountKeyArgs,
): GetAccountKeyResult => {
  const valid = RpcQueryAccessKeyViewResponseSchema.parse(result);

  if ('error' in valid)
    throw new NatError({
      code: 'AccountKeyNotFound',
      message: `This account does not have such key.`,
      cause: valid,
    });

  return {
    blockHash: valid.blockHash,
    blockHeight: valid.blockHeight,
    accountId: args.accountId,
    accountKey: transformKey({
      accessKey: valid,
      publicKey: args.publicKey,
    }),
  };
};

export const createGetAccountKey: CreateGetAccountKey =
  ({ sendRequest }) =>
  async (args) => {
    const result = await sendRequest({
      method: 'query',
      params: {
        request_type: 'view_access_key',
        account_id: args.accountId,
        public_key: args.publicKey,
        ...toNativeBlockReference(args.atMomentOf),
      },
      transportPolicy: args.policies?.transport,
      signal: args.options?.signal,
    });

    return transformResult(result, args);
  };
