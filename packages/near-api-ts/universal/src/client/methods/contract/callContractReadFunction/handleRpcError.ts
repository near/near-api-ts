import { ErrorWrapperFor_RpcQueryErrorSchema } from '@near-js/jsonrpc-types';
import { createNatError, resultNatError } from '../../../../_common/natError';
import type { RpcResponse } from '../../../../_common/schemas/zod/rpc/rpc';

export const handleRpcError = (rpcResponse: RpcResponse) => {
  // We use QueryErrorSchema cuz there is no separate 'view_access_key' method -
  // it's part of 'query'
  const rpcError = ErrorWrapperFor_RpcQueryErrorSchema().safeParse(rpcResponse.error);

  if (!rpcError.success)
    return resultNatError('Client.CallContractReadFunction.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcError.error },
      }),
    });

  const { name, cause } = rpcError.data;

  if (name === 'HANDLER_ERROR') {
    if (cause.name === 'GARBAGE_COLLECTED_BLOCK')
      return resultNatError(`Client.CallContractReadFunction.Rpc.Block.GarbageCollected`, {
        blockHash: cause.info.blockHash,
        blockHeight: cause.info.blockHeight,
      });

    // Most likely it's not really possible to get UNKNOWN_BLOCK error when trying to
    // fetch data from relative block like 'LatestFinalBlock' or 'EarliestAvailableBlock'
    if (cause.name === 'UNKNOWN_BLOCK' && 'blockId' in cause.info.blockReference)
      return resultNatError(`Client.CallContractReadFunction.Rpc.Block.NotFound`, {
        blockId: cause.info.blockReference.blockId,
      });

    if (cause.name === 'UNKNOWN_ACCOUNT')
      return resultNatError(`Client.CallContractReadFunction.Rpc.Account.NotFound`, {
        contractAccountId: cause.info.requestedAccountId,
        blockHash: cause.info.blockHash,
        blockHeight: cause.info.blockHeight,
      });
  }

  return resultNatError('Client.CallContractReadFunction.Internal', { cause: rpcResponse });
};
