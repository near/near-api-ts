import { ErrorWrapperFor_RpcTransactionErrorSchema } from '@near-js/jsonrpc-types';
import { createNatError, resultNatError } from '../../../../_common/natError';
import type { RpcResponse } from '../../../../_common/schemas/zod/rpc/rpc';

export const handleRpcError = (rpcResponse: RpcResponse) => {
  // TODO replace with own schema - remove dead errors
  const rpcError = ErrorWrapperFor_RpcTransactionErrorSchema().safeParse(rpcResponse.error);

  if (!rpcError.success)
    return resultNatError('Client.GetTransactionResult.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcError.error },
      }),
    });

  const { name, cause } = rpcError.data;

  if (name === 'HANDLER_ERROR') {
    if (cause.name === 'UNKNOWN_TRANSACTION')
      return resultNatError('Client.GetTransactionResult.Rpc.Transaction.NotFound', {
        transactionHash: cause.info.requestedTransactionHash,
      });
  }

  return resultNatError('Client.GetTransactionResult.Internal', {
    cause: rpcResponse,
  });
};
