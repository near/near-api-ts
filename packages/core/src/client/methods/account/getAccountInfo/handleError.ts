import type { RpcResponse } from '@common/schemas/zod/rpc';
import { createNatError } from '@common/natError';
import { ErrorWrapperFor_RpcQueryErrorSchema } from '@near-js/jsonrpc-types';
import { result } from '@common/utils/result';

export const handleError = (rpcResponse: RpcResponse) => {
  // We use QueryErrorSchema cuz there is no separate 'view_account' method -
  // it's part of 'query'
  const rpcError = ErrorWrapperFor_RpcQueryErrorSchema().safeParse(
    rpcResponse.error,
  );

  if (!rpcError.success)
    return result.err(
      createNatError({
        kind: 'Client.GetAccountInfo.SendRequest.Failed',
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
    // General 'query' Errors
    if (cause.name === 'NO_SYNCED_BLOCKS')
      return result.err(
        createNatError({
          kind: `Client.GetAccountInfo.Rpc.NotSynced`,
          context: null,
        }),
      );

    if (cause.name === 'UNAVAILABLE_SHARD')
      return result.err(
        createNatError({
          kind: `Client.GetAccountInfo.Rpc.Shard.NotTracked`,
          context: { shardId: cause.info.requestedShardId },
        }),
      );

    if (cause.name === 'GARBAGE_COLLECTED_BLOCK')
      return result.err(
        createNatError({
          kind: `Client.GetAccountInfo.Rpc.Block.GarbageCollected`,
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
          kind: `Client.GetAccountInfo.Rpc.Block.NotFound`,
          context: {
            blockId: cause.info.blockReference.blockId,
          },
        }),
      );
  }

  // Account specific errors

  if (cause.name === 'UNKNOWN_ACCOUNT')
    return result.err(
      createNatError({
        kind: `Client.GetAccountInfo.Rpc.Account.NotFound`,
        context: {
          accountId: cause.info.requestedAccountId,
          blockHash: cause.info.blockHash,
          blockHeight: cause.info.blockHeight,
        },
      }),
    );

  // Stub

  return result.err(
    createNatError({
      kind: 'Client.GetAccountInfo.Internal',
      context: {
        cause: createNatError({
          kind: 'Client.GetAccountInfo.Rpc.Unclassified',
          context: { rpcResponse },
        }),
      },
    }),
  );
};
