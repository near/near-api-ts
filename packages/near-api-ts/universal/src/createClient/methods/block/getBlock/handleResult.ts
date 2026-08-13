import { RpcBlockResponseSchema } from '@near-js/jsonrpc-types';
import { createNatError } from '../../../../_common/_common/_common/natError';
import { result } from '../../../../_common/_common/result';
import type { BaseRpcResponse } from '../../../_common/zodSchemas/baseRpcResponse';

export const handleResult = (rpcResponse: BaseRpcResponse) => {
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
