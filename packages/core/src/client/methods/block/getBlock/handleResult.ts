import { RpcBlockResponseSchema } from '@near-js/jsonrpc-types';
import type { RpcResponse } from '@common/schemas/zod/rpc';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';

export const handleResult = (rpcResponse: RpcResponse) => {
  const rpcResult = RpcBlockResponseSchema().safeParse(rpcResponse.result);

  if (!rpcResult.success)
    return result.err(
      createNatError({
        kind: 'Client.GetBlock.SendRequest.Failed',
        context: {
          cause: createNatError({
            kind: 'Client.Transport.SendRequest.Response.Result.InvalidSchema',
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
