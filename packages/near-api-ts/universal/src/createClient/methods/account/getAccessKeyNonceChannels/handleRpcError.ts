import { ErrorWrapperFor_RpcQueryErrorSchema } from '@near-js/jsonrpc-types';
import type { GetAccessKeyNonceChannelsArgs } from '../../../../../types/client/methods/account/getAccessKeyNonceChannels';
import { createNatError } from '../../../../_common/_common/_common/_common/natError';
import { resultNatError } from '../../../../_common/_common/_common/result';
import type { BaseRpcResponse } from '../../../_common/zodSchemas/baseRpcResponse';

export const handleRpcError = (
  rpcResponse: BaseRpcResponse,
  args: GetAccessKeyNonceChannelsArgs,
) => {
  // We use QueryErrorSchema cuz there is no separate 'view_gas_key_nonces' method -
  // it's part of 'query'
  const rpcError = ErrorWrapperFor_RpcQueryErrorSchema().safeParse(rpcResponse.error);

  if (!rpcError.success)
    return resultNatError('Client.GetAccessKeyNonceChannels.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcError.error },
      }),
    });

  const { name, cause } = rpcError.data;

  if (name === 'HANDLER_ERROR') {
    // General 'query' Errors
    if (cause.name === 'NO_SYNCED_BLOCKS')
      return resultNatError('Client.GetAccessKeyNonceChannels.Rpc.NotSynced', null);

    if (cause.name === 'UNAVAILABLE_SHARD')
      return resultNatError('Client.GetAccessKeyNonceChannels.Rpc.Shard.NotTracked', {
        shardId: cause.info.requestedShardId,
      });

    if (cause.name === 'GARBAGE_COLLECTED_BLOCK')
      return resultNatError('Client.GetAccessKeyNonceChannels.Rpc.Block.GarbageCollected', {
        blockHash: cause.info.blockHash,
        blockHeight: cause.info.blockHeight,
      });

    if (cause.name === 'UNKNOWN_BLOCK' && 'blockId' in cause.info.blockReference)
      return resultNatError('Client.GetAccessKeyNonceChannels.Rpc.Block.NotFound', {
        blockId: cause.info.blockReference.blockId,
      });

    // Nearcore does not tell a missing account, a missing key and a key with a single
    // nonce channel apart - it reads the key and reports UNKNOWN_GAS_KEY for all three
    if (cause.name === 'UNKNOWN_GAS_KEY')
      return resultNatError('Client.GetAccessKeyNonceChannels.Rpc.NonceChannels.NotFound', {
        accountId: args.accountId,
        publicKey: args.publicKey,
        atMomentOf: {
          blockHash: cause.info.blockHash,
          blockHeight: cause.info.blockHeight,
        },
      });
  }

  return resultNatError('Client.GetAccessKeyNonceChannels.Internal', { cause: rpcResponse });
};
