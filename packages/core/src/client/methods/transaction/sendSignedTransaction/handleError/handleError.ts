import type { RpcResponse } from '@common/schemas/zod/rpc';
import { createNatError } from '@common/natError';
import { ErrorWrapperFor_RpcTransactionErrorSchema } from '@near-js/jsonrpc-types';
import { result } from '@common/utils/result';
import { handleInvalidTransaction } from './handleInvalidTransaction';

export const handleError = (rpcResponse: RpcResponse) => {
  const rpcError = ErrorWrapperFor_RpcTransactionErrorSchema().safeParse(
    rpcResponse.error,
  );

  if (!rpcError.success)
    return result.err(
      createNatError({
        kind: 'Client.SendSignedTransaction.Response.InvalidSchema',
        context: { zodError: rpcError.error },
      }),
    );

  const { name, cause } = rpcError.data;

  if (name === 'INTERNAL_ERROR')
    return result.err(
      createNatError({
        kind: `Client.SendSignedTransaction.Rpc.Internal`,
        context: { message: cause.info.errorMessage },
      }),
    );

  if (name === 'HANDLER_ERROR') {
    if (cause.name === 'INTERNAL_ERROR')
      return result.err(
        createNatError({
          kind: `Client.SendSignedTransaction.Rpc.Internal`,
          context: { message: cause.info.debugInfo },
        }),
      );

    if (cause.name === 'TIMEOUT_ERROR')
      return result.err(
        createNatError({
          kind: `Client.SendSignedTransaction.Rpc.Transaction.Timeout`,
          context: null,
        }),
      );

    if (cause.name === 'INVALID_TRANSACTION')
      return handleInvalidTransaction(rpcResponse);
  }

  // Stub
  return result.err(
    createNatError({
      kind: 'Client.SendSignedTransaction.Unknown',
      context: {
        cause: {
          kind: 'RpcError.Unclassified',
          rpcResponse,
        },
      },
    }),
  );
};
