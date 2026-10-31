import { ErrorWrapperFor_RpcBlockErrorSchema } from '@near-js/jsonrpc-types';
import { createNatError } from '../../../../_common/_common/_common/_common/natError';
import { resultNatError } from '../../../../_common/_common/_common/result';
import type { BaseRpcResponse } from '../../../_common/zodSchemas/baseRpcResponse';

export const handleRpcError = (rpcResponse: BaseRpcResponse) => {
  const rpcError = ErrorWrapperFor_RpcBlockErrorSchema().safeParse(rpcResponse.error);

  if (!rpcError.success)
    return resultNatError('Client.GetBlock.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcError.error },
      }),
    });

  const { name, cause } = rpcError.data;

  // Block errors
  if (name === 'HANDLER_ERROR') {
    if (cause.name === 'NOT_SYNCED_YET')
      return resultNatError(`Client.GetBlock.Rpc.NotSynced`, null);

    if (cause.name === 'UNKNOWN_BLOCK')
      return resultNatError(
        `Client.GetBlock.Rpc.Block.NotFound`,
        null, // TODO parse error message string and return blockId
      );
  }

  // Stub
  return resultNatError('Client.GetBlock.Internal', { cause: rpcResponse });
};
