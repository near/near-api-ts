import { AccessKeyViewSchema } from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import type { GetAccessKeyArgs } from '../../../../../types/client/methods/account/getAccessKey';
import { createNatError } from '../../../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../../../_common/_common/_common/result';
import { toPublicKeyRef } from '../../../../_common/toPublicKeyRef';
import type { InnerPublicKey } from '../../../../_common/zodSchemas/publicKey';
import type { BaseRpcResponse } from '../../../_common/zodSchemas/baseRpcResponse';
import { transformAccessKey } from '../_common/transformAccessKey';

// For legacy reasons, nearcore returns result.error string field when
// RpcQueryError::UnknownAccessKey error happens;
const UnknownKeySchema = z.object({
  blockHash: z.string(),
  blockHeight: z.number(),
  error: z.string(),
  logs: z.array(z.string()), // will always an empty array
});

const RpcQueryViewAccessKeyOkResultSchema = z.object({
  blockHash: z.string(),
  blockHeight: z.number(),
  ...AccessKeyViewSchema().shape,
});

const RpcQueryViewAccessKeyResultSchema = z.union([
  RpcQueryViewAccessKeyOkResultSchema,
  UnknownKeySchema,
]);

export const handleRpcResult = (
  rpcResponse: BaseRpcResponse,
  args: GetAccessKeyArgs,
  publicKey: InnerPublicKey,
) => {
  const rpcResult = RpcQueryViewAccessKeyResultSchema.safeParse(rpcResponse.result);

  if (!rpcResult.success)
    return resultNatError('Client.GetAccessKey.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcResult.error },
      }),
    });

  const { blockHash, blockHeight } = rpcResult.data;

  // This will only happen for RpcQueryError::UnknownAccessKey error;
  // All others are going into response.error, and we handle them in handleRpcError;
  // https://github.com/near/nearcore/blob/a9557047d1bd45da0d06cf6b880fea6487c35e20/chain/jsonrpc/src/lib.rs#L210C13-L219C17
  if ('error' in rpcResult.data)
    return result.err(
      createNatError({
        kind: 'Client.GetAccessKey.Rpc.AccessKey.NotFound',
        context: {
          accountId: args.accountId,
          publicKey: args.publicKey,
          blockHash,
          blockHeight,
        },
      }),
    );

  return result.ok({
    accountId: args.accountId,
    accessKey: transformAccessKey({
      publicKeyRef: toPublicKeyRef(publicKey),
      accessKey: rpcResult.data,
    }),
    atMomentOf: { blockHash, blockHeight },
  });
};
