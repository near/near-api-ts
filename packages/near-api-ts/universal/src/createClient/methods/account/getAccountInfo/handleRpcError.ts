import { ErrorWrapperFor_RpcQueryErrorSchema } from '@near-js/jsonrpc-types';
import { createNatError } from '../../../../_common/_common/_common/_common/natError';
import { resultNatError } from '../../../../_common/_common/_common/result';
import type { BaseRpcResponse } from '../../../_common/zodSchemas/baseRpcResponse';

export const handleRpcError = (rpcResponse: BaseRpcResponse) => {
  // We use QueryErrorSchema cuz there is no separate 'view_account' method -
  // it's part of 'query'
  const rpcError = ErrorWrapperFor_RpcQueryErrorSchema().safeParse(rpcResponse.error);

  if (!rpcError.success)
    return resultNatError('Client.GetAccountInfo.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcError.error },
      }),
    });

  const { name, cause } = rpcError.data;

  if (name === 'HANDLER_ERROR') {
    // General 'query' Errors
    if (cause.name === 'NO_SYNCED_BLOCKS')
      return resultNatError(`Client.GetAccountInfo.Rpc.NotSynced`, null);

    if (cause.name === 'GARBAGE_COLLECTED_BLOCK')
      return resultNatError(`Client.GetAccountInfo.Rpc.Block.GarbageCollected`, {
        blockHash: cause.info.blockHash,
        blockHeight: cause.info.blockHeight,
      });

    // Most likely it's not really possible to get UNKNOWN_BLOCK error when trying to
    // fetch data from relative block like 'LatestFinalBlock' or 'EarliestAvailableBlock'
    if (cause.name === 'UNKNOWN_BLOCK' && 'blockId' in cause.info.blockReference)
      return resultNatError(`Client.GetAccountInfo.Rpc.Block.NotFound`, {
        blockId: cause.info.blockReference.blockId,
      });

    // Account-specific errors
    if (cause.name === 'UNKNOWN_ACCOUNT')
      return resultNatError(`Client.GetAccountInfo.Rpc.Account.NotFound`, {
        accountId: cause.info.requestedAccountId,
        blockHash: cause.info.blockHash,
        blockHeight: cause.info.blockHeight,
      });
  }

  return resultNatError('Client.GetAccountInfo.Internal', { cause: rpcResponse });
};
