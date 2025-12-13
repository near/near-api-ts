import type { RpcResponse } from '@common/schemas/zod/rpc';
import { createNatError } from '@common/natError';
import { ErrorWrapperFor_RpcBlockErrorSchema } from '@near-js/jsonrpc-types';
import { result } from '@common/utils/result';

export const handleError = (rpcResponse: RpcResponse) => {
  const rpcError = ErrorWrapperFor_RpcBlockErrorSchema().safeParse(
    rpcResponse.error,
  );

  if (!rpcError.success)
    return result.err(
      createNatError({
        kind: 'Client.GetBlock.SendRequest.Failed',
        context: {
          cause: createNatError({
            kind: 'Client.Transport.SendRequest.Response.Error.InvalidSchema',
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
          context: null,
        }),
      );
  }

  // Stub
  return result.err(
    createNatError({
      kind: 'Client.GetBlock.Internal',
      context: {
        cause: createNatError({
          kind: 'Client.GetBlock.Rpc.Unclassified',
          context: { rpcResponse },
        }),
      },
    }),
  );
};
