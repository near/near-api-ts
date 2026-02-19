import { ErrorWrapperFor_RpcQueryErrorSchema } from '@near-js/jsonrpc-types';
import { createNatError } from '../../../../_common/natError';
import type { RpcResponse } from '../../../../_common/schemas/zod/rpc';
import { result } from '../../../../_common/utils/result';

export const handleError = (rpcResponse: RpcResponse) => {
  // We use QueryErrorSchema cuz there is no separate 'view_access_key' method -
  // it's part of 'query'
  const rpcError = ErrorWrapperFor_RpcQueryErrorSchema().safeParse(
    rpcResponse.error,
  );

  if (!rpcError.success)
    return result.err(
      createNatError({
        kind: 'Client.CallContractReadFunction.Exhausted',
        context: {
          lastError: createNatError({
            kind: 'SendRequest.Attempt.Response.InvalidSchema',
            context: { zodError: rpcError.error },
          }),
        },
      }),
    );

  const { name, cause } = rpcError.data;

  if (name === 'HANDLER_ERROR') {
    // General 'query' Errors
    if (cause.name === 'NO_SYNCED_BLOCKS')
      return result.err(
        createNatError({
          kind: `Client.CallContractReadFunction.Rpc.NotSynced`,
          context: null,
        }),
      );

    if (cause.name === 'UNAVAILABLE_SHARD')
      return result.err(
        createNatError({
          kind: `Client.CallContractReadFunction.Rpc.Shard.NotTracked`,
          context: { shardId: cause.info.requestedShardId },
        }),
      );

    if (cause.name === 'GARBAGE_COLLECTED_BLOCK')
      return result.err(
        createNatError({
          kind: `Client.CallContractReadFunction.Rpc.Block.GarbageCollected`,
          context: {
            blockHash: cause.info.blockHash,
            blockHeight: cause.info.blockHeight,
          },
        }),
      );

    // Most likely it's not really possible to get UNKNOWN_BLOCK error when trying to
    // fetch data from relative block like 'LatestFinalBlock' or 'EarliestAvailableBlock'
    if (
      cause.name === 'UNKNOWN_BLOCK' &&
      'blockId' in cause.info.blockReference
    )
      return result.err(
        createNatError({
          kind: `Client.CallContractReadFunction.Rpc.Block.NotFound`,
          context: {
            blockId: cause.info.blockReference.blockId,
          },
        }),
      );
  }

  // Stub
  return result.err(
    createNatError({
      kind: 'Client.CallContractReadFunction.Internal',
      context: { cause: rpcResponse },
    }),
  );
};
