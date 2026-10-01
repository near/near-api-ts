import { GasKeyNoncesViewSchema } from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import type { GetAccessKeyNonceChannelsArgs } from '../../../../../types/client/methods/account/getAccessKeyNonceChannels';
import { createNatError } from '../../../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../../../_common/_common/_common/result';
import { toPublicKeyRef } from '../../../../_common/toPublicKeyRef';
import type { InnerPublicKey } from '../../../../_common/zodSchemas/publicKey';
import type { BaseRpcResponse } from '../../../_common/zodSchemas/baseRpcResponse';

const RpcQueryViewGasKeyNoncesResultSchema = z.object({
  ...GasKeyNoncesViewSchema().shape,
  blockHash: z.string(),
  blockHeight: z.number(),
});

export const handleRpcResult = (
  rpcResponse: BaseRpcResponse,
  args: GetAccessKeyNonceChannelsArgs,
  publicKey: InnerPublicKey,
) => {
  const rpcResult = RpcQueryViewGasKeyNoncesResultSchema.safeParse(rpcResponse.result);

  if (!rpcResult.success)
    return resultNatError('Client.GetAccessKeyNonceChannels.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcResult.error },
      }),
    });

  const { nonces, blockHash, blockHeight } = rpcResult.data;

  return result.ok({
    accountId: args.accountId,
    publicKeyRef: toPublicKeyRef(publicKey),
    nonceChannels: nonces.map((lastNonce, channelId) => ({ channelId, lastNonce })),
    atMomentOf: { blockHash, blockHeight },
  });
};
