import { AccessKeyInfoViewSchema, AccessKeyListSchema } from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import type { GetAccessKeysArgs } from '../../../../../types/client/methods/account/getAccessKeys';
import { createNatError } from '../../../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../../../_common/_common/_common/result';
import { PublicKeyIdZodSchema } from '../../../../_common/zodSchemas/publicKeyId';
import type { BaseRpcResponse } from '../../../_common/zodSchemas/baseRpcResponse';
import { transformAccessKey } from '../_common/transformAccessKey';

const RpcQueryAccessKeyListResultSchema = z.object({
  ...AccessKeyListSchema().shape,
  // The node refers to each key by its PublicKeyHandle, which is our PublicKeyId
  keys: z.array(
    z.object({
      ...AccessKeyInfoViewSchema().shape,
      publicKey: PublicKeyIdZodSchema,
    }),
  ),
  blockHash: z.string(),
  blockHeight: z.number(),
});

export const handleRpcResult = (rpcResponse: BaseRpcResponse, args: GetAccessKeysArgs) => {
  const rpcResult = RpcQueryAccessKeyListResultSchema.safeParse(rpcResponse.result);

  if (!rpcResult.success)
    return resultNatError('Client.GetAccessKeys.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcResult.error },
      }),
    });

  const { keys, blockHash, blockHeight } = rpcResult.data;

  return result.ok({
    accountId: args.accountId,
    accessKeys: keys.map(({ publicKey, accessKey }) =>
      transformAccessKey({ publicKeyId: publicKey, accessKey }),
    ),
    atMomentOf: { blockHash, blockHeight },
  });
};
