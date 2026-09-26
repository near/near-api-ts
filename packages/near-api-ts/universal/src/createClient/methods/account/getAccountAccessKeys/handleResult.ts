import { AccessKeyInfoViewSchema, AccessKeyListSchema } from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import type { GetAccountAccessKeysArgs } from '../../../../../types/client/methods/account/getAccountAccessKeys';
import type { Prettify } from '../../../../../types/utils';
import { createNatError } from '../../../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../../../_common/_common/_common/result';
import { PublicKeyRefZodSchema } from '../../../../_common/zodSchemas/publicKeyRef';
import type { BaseRpcResponse } from '../../../_common/zodSchemas/baseRpcResponse';
import { transformAccessKey } from '../_common/transformAccessKey';

const RpcQueryAccessKeyListResultSchema = z.object({
  ...AccessKeyListSchema().shape,
  // The node refers to each key by its PublicKeyHandle, which is our PublicKeyRef
  keys: z.array(
    z.object({
      ...AccessKeyInfoViewSchema().shape,
      publicKey: PublicKeyRefZodSchema,
    }),
  ),
  blockHash: z.string(),
  blockHeight: z.number(),
});

export type RpcQueryAccessKeyListResult = Prettify<
  z.infer<typeof RpcQueryAccessKeyListResultSchema>
>;

export const handleResult = (rpcResponse: BaseRpcResponse, args: GetAccountAccessKeysArgs) => {
  const rpcResult = RpcQueryAccessKeyListResultSchema.safeParse(rpcResponse.result);

  if (!rpcResult.success)
    return resultNatError('Client.GetAccountAccessKeys.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcResult.error },
      }),
    });

  const { blockHash, blockHeight } = rpcResult.data;

  const output = {
    blockHash,
    blockHeight,
    accountId: args.accountId,
    accountAccessKeys: rpcResult.data.keys.map(({ publicKey, accessKey }) =>
      transformAccessKey({ publicKeyRef: publicKey, accessKey }),
    ),
    rawRpcResult: rpcResult.data,
  };

  return result.ok(output);
};
