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
        kind: 'Client.SendSignedTransaction.SendRequest.Failed',
        context: {
          cause: createNatError({
            kind: 'Client.Transport.SendRequest.Response.Error.InvalidSchema',
            context: { zodError: rpcError.error },
          }),
        },
      }),
    );

  const { name, cause } = rpcError.data;

  if (name === 'HANDLER_ERROR') {
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
      kind: 'Client.SendSignedTransaction.Internal',
      context: {
        cause: createNatError({
          kind: 'Client.SendSignedTransaction.Rpc.Unclassified',
          context: { rpcResponse },
        }),
      },
    }),
  );
};
