import * as z from 'zod/mini';
import { AccessKeyListSchema } from '@near-js/jsonrpc-types';
import type { RpcResponse } from '../../../../_common/schemas/zod/rpc';
import { result } from '../../../../_common/utils/result';
import { createNatError } from '../../../../_common/natError';
import { transformAccessKey } from '../_common/transformAccessKey';
import type { GetAccountAccessKeysArgs } from '../../../../../types/client/methods/account/getAccountAccessKeys';

const RpcQueryAccessKeyListResultSchema = z.object({
  ...AccessKeyListSchema().shape,
  blockHash: z.string(),
  blockHeight: z.number(),
});

export type RpcQueryAccessKeyListResult = z.infer<
  typeof RpcQueryAccessKeyListResultSchema
>;

export const handleResult = (
  rpcResponse: RpcResponse,
  args: GetAccountAccessKeysArgs,
) => {
  const rpcResult = RpcQueryAccessKeyListResultSchema.safeParse(
    rpcResponse.result,
  );

  if (!rpcResult.success)
    return result.err(
      createNatError({
        kind: 'Client.GetAccountAccessKeys.Exhausted',
        context: {
          lastError: createNatError({
            kind: 'SendRequest.Attempt.Response.InvalidSchema',
            context: { zodError: rpcResult.error },
          }),
        },
      }),
    );

  const { blockHash, blockHeight } = rpcResult.data;

  const output = {
    blockHash,
    blockHeight,
    accountId: args.accountId,
    accountAccessKeys: rpcResult.data.keys.map(transformAccessKey),
    rawRpcResult: rpcResult.data,
  };

  return result.ok(output);
};
