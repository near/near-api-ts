import { RpcBlockResponseSchema } from '@near-js/jsonrpc-types';
import type { RpcResponse } from '../../../../_common/schemas/zod/rpc';
import { result } from '../../../../_common/utils/result';
import { createNatError } from '../../../../_common/natError';

export const handleResult = (rpcResponse: RpcResponse) => {
  const rpcResult = RpcBlockResponseSchema().safeParse(rpcResponse.result);

  if (!rpcResult.success)
    return result.err(
      createNatError({
        kind: 'Client.GetBlock.Exhausted',
        context: {
          lastError: createNatError({
            kind: 'SendRequest.Attempt.Response.InvalidSchema',
            context: { zodError: rpcResult.error },
          }),
        },
      }),
    );

  const output = {
    rawRpcResult: rpcResult.data,
  };

  return result.ok(output);
};
