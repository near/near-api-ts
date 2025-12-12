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
        kind: 'Client.GetBlock.Response.InvalidSchema',
        context: { zodError: rpcError.error },
      }),
    );

  const { name, cause } = rpcError.data;

  // General errors
  if (name === 'INTERNAL_ERROR')
    return result.err(
      createNatError({
        kind: `Client.GetBlock.Rpc.Internal`,
        context: { message: cause.info.errorMessage },
      }),
    );

  if (name === 'HANDLER_ERROR' && cause.name === 'INTERNAL_ERROR') {
    return result.err(
      createNatError({
        kind: `Client.GetBlock.Rpc.Internal`,
        context: { message: cause.info.errorMessage },
      }),
    );
  }

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
      kind: 'Client.GetBlock.Unknown',
      context: {
        cause: {
          kind: 'RpcError.Unclassified',
          rpcResponse,
        },
      },
    }),
  );
};
