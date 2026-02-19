import { AccessKeyViewSchema } from '@near-js/jsonrpc-types';
import type { GetAccountAccessKeyArgs } from '@universal/types/client/methods/account/getAccountAccessKey';
import * as z from 'zod/mini';
import { createNatError } from '../../../../_common/natError';
import type { RpcResponse } from '../../../../_common/schemas/zod/rpc';
import { result } from '../../../../_common/utils/result';
import { transformAccessKey } from '../_common/transformAccessKey';

// For legacy reasons, nearcore returns result.error string field when
// RpcQueryError::UnknownAccessKey error happen;
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

export type RpcQueryViewAccessKeyOkResult = z.infer<
  typeof RpcQueryViewAccessKeyOkResultSchema
>;

const RpcQueryViewAccessKeyResultSchema = z.union([
  RpcQueryViewAccessKeyOkResultSchema,
  UnknownKeySchema,
]);

export const handleResult = (
  rpcResponse: RpcResponse,
  args: GetAccountAccessKeyArgs,
) => {
  const rpcResult = RpcQueryViewAccessKeyResultSchema.safeParse(
    rpcResponse.result,
  );

  if (!rpcResult.success)
    return result.err(
      createNatError({
        kind: 'Client.GetAccountAccessKey.Exhausted',
        context: {
          lastError: createNatError({
            kind: 'SendRequest.Attempt.Response.InvalidSchema',
            context: { zodError: rpcResult.error },
          }),
        },
      }),
    );

  const { blockHash, blockHeight } = rpcResult.data;

  // This will only happen for RpcQueryError::UnknownAccessKey error;
  // All others are going into response.error, and we handle them in handleError;
  // https://github.com/near/nearcore/blob/a9557047d1bd45da0d06cf6b880fea6487c35e20/chain/jsonrpc/src/lib.rs#L210C13-L219C17
  if ('error' in rpcResult.data)
    return result.err(
      createNatError({
        kind: 'Client.GetAccountAccessKey.Rpc.AccountAccessKey.NotFound',
        context: {
          accountId: args.accountId,
          publicKey: args.publicKey,
          blockHash,
          blockHeight,
        },
      }),
    );

  const output = {
    blockHash,
    blockHeight,
    accountId: args.accountId,
    accountAccessKey: transformAccessKey({
      accessKey: rpcResult.data,
      publicKey: args.publicKey,
    }),
    rawRpcResult: rpcResult.data,
  };

  return result.ok(output);
};
