import { ErrorWrapperFor_RpcBlockErrorSchema } from '@near-js/jsonrpc-types';
import { createNatError } from '../../../../_common/natError';
import type { RpcResponse } from '../../../../_common/schemas/zod/rpc';
import { result } from '../../../../_common/utils/result';

export const handleError = (rpcResponse: RpcResponse) => {
  const rpcError = ErrorWrapperFor_RpcBlockErrorSchema().safeParse(
    rpcResponse.error,
  );

  if (!rpcError.success)
    return result.err(
      createNatError({
        kind: 'Client.GetBlock.Exhausted',
        context: {
          lastError: createNatError({
            kind: 'SendRequest.Attempt.Response.InvalidSchema',
            context: { zodError: rpcError.error },
          }),
        },
      }),
    );

  const { name, cause } = rpcError.data;

  // Block errors
  if (name === 'HANDLER_ERROR') {
    if (cause.name === 'NOT_SYNCED_YET')
      return result.err(
        createNatError({
          kind: `Client.GetBlock.Rpc.NotSynced`,
          context: null,
        }),
      );

    if (cause.name === 'UNKNOWN_BLOCK')
      return result.err(
        createNatError({
          kind: `Client.GetBlock.Rpc.Block.NotFound`,
          context: null, // TODO parse error message string and return blockId
        }),
      );
  }

  // Stub
  return result.err(
    createNatError({
      kind: 'Client.GetBlock.Internal',
      context: { cause: rpcResponse },
    }),
  );
};
