import { ErrorWrapperFor_RpcQueryErrorSchema } from '@near-js/jsonrpc-types';
import { createNatError } from '../../../../_common/_common/_common/_common/natError';
import { resultNatError } from '../../../../_common/_common/_common/result';
import type { BaseRpcResponse } from '../../../_common/zodSchemas/baseRpcResponse';

// TODO Think how to reuse some errors and reduce the amount of code

export const handleRpcError = (rpcResponse: BaseRpcResponse) => {
  // We use QueryErrorSchema cuz there is no separate 'view_access_key' method -
  // it's part of 'query'
  const rpcError = ErrorWrapperFor_RpcQueryErrorSchema().safeParse(rpcResponse.error);

  if (!rpcError.success)
    return resultNatError('Client.GetAccessKey.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcError.error },
      }),
    });

  const { name, cause } = rpcError.data;

  if (name === 'HANDLER_ERROR') {
    // General 'query' Errors
    if (cause.name === 'NO_SYNCED_BLOCKS')
      return resultNatError(`Client.GetAccessKey.Rpc.NotSynced`, null);

    if (cause.name === 'UNAVAILABLE_SHARD')
      return resultNatError(`Client.GetAccessKey.Rpc.Shard.NotTracked`, {
        shardId: cause.info.requestedShardId,
      });

    if (cause.name === 'GARBAGE_COLLECTED_BLOCK')
      return resultNatError(`Client.GetAccessKey.Rpc.Block.GarbageCollected`, {
        blockHash: cause.info.blockHash,
        blockHeight: cause.info.blockHeight,
      });

    // Most likely it's not really possible to get UNKNOWN_BLOCK error when trying to
    // fetch data from relative block like 'LatestFinalBlock' or 'EarliestAvailableBlock'
    if (cause.name === 'UNKNOWN_BLOCK' && 'blockId' in cause.info.blockReference)
      return resultNatError(`Client.GetAccessKey.Rpc.Block.NotFound`, {
        blockId: cause.info.blockReference.blockId,
      });
  }

  // Stub

  return resultNatError('Client.GetAccessKey.Internal', { cause: rpcResponse });
};
