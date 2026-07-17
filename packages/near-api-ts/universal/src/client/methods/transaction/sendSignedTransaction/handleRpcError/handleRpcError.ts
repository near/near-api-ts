import { ErrorWrapperFor_RpcTransactionErrorSchema } from '@near-js/jsonrpc-types';
import { createNatError, resultNatError } from '../../../../../_common/natError';
import type { RpcResponse } from '../../../../../_common/schemas/zod/rpc/rpc';
import { result } from '../../../../../_common/utils/result';
import { handleInvalidTransaction } from './handleInvalidTransaction';

export const handleRpcError = (rpcResponse: RpcResponse) => {
  const rpcError = ErrorWrapperFor_RpcTransactionErrorSchema().safeParse(rpcResponse.error);

  if (!rpcError.success)
    return resultNatError('Client.SendSignedTransaction.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcError.error },
      }),
    });

  const { name, cause } = rpcError.data;

  // if (name === 'HANDLER_ERROR') {
  //   if (cause.name === 'TIMEOUT_ERROR')
  //     return result.err(
  //       createNatError({
  //         kind: `Client.SendSignedTransaction.Rpc.Transaction.Timeout`,
  //         context: null,
  //       }),
  //     );
  //
  //   if (cause.name === 'INVALID_TRANSACTION') return handleInvalidTransaction(rpcResponse);
  // }

  // Stub
  return resultNatError('Client.SendSignedTransaction.Internal', { cause: rpcResponse });
};
