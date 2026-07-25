import { ErrorWrapperFor_RpcTransactionErrorSchema } from '@near-js/jsonrpc-types';
import { createNatError, resultNatError } from '../../../../../_common/natError';
import type { RpcResponse } from '../../../../../_common/schemas/zod/rpc/rpc';
import { handleInvalidTransaction } from './handleInvalidTransaction';

export const handleRpcError = (rpcResponse: RpcResponse) => {
  const schema = ErrorWrapperFor_RpcTransactionErrorSchema();
  const rpcError = schema.safeParse(rpcResponse.error);

  if (!rpcError.success)
    return resultNatError('Client.SendSignedTransaction.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        // @ts-ignore
        context: { zodError: rpcError.error },
      }),
    });

  const { name, cause } = rpcError.data;

  if (name === 'HANDLER_ERROR') {
    if (cause.name === 'TIMEOUT_ERROR')
      return resultNatError(`Client.SendSignedTransaction.Rpc.Timeout`, null);

    if (cause.name === 'INVALID_TRANSACTION') return handleInvalidTransaction(rpcResponse);
  }

  return resultNatError('Client.SendSignedTransaction.Internal', { cause: rpcResponse });
};
