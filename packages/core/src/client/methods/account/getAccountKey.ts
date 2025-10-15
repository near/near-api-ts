import * as z from 'zod/mini';
import { toNativeBlockReference } from '@common/transformers/toNative/blockReference';
import type {
  CreateGetAccountKey,
  GetAccountKeyArgs,
} from 'nat-types/client/methods/account/getAccountKey';
import type { GetAccountKeyResult } from 'nat-types/client/methods/account/getAccountKey';
import { AccessKeyViewSchema, CryptoHashSchema } from '@near-js/jsonrpc-types';
import { transformKey } from './helpers/transformKey';

const RpcQueryAccessKeyViewResponseSchema = z.object({
  ...AccessKeyViewSchema().shape,
  blockHash: CryptoHashSchema(),
  blockHeight: z.number(),
});

/* TODO handle error
{
    "jsonrpc": "2.0",
    "result": {
        "block_hash": "EBKFaNMjXbpekTTcSkuELuMkGxsp5SHZVLknQWsA9aw4",
        "block_height": 168412701,
        "error": "access key ed25519:2daCm7Ux8igXXFDtMJ2nSRHVR5PM8jSaarum6X8ka9o2 does not exist while viewing",
        "logs": []
    },
    "id": 0
}
 */

const transformResult = (
  result: unknown,
  args: GetAccountKeyArgs,
): GetAccountKeyResult => {
  const valid = RpcQueryAccessKeyViewResponseSchema.parse(result);

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
    });
    return transformResult(result, args);
  };
