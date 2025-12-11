import * as z from 'zod/mini';
import { RpcTransactionResponseSchema } from '@near-js/jsonrpc-types';
import type { RpcResponse } from '@common/schemas/zod/rpc';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import type { SendSignedTransactionArgs } from 'nat-types/client/methods/transaction/sendSignedTransaction';
import { handleActionError } from './handleActionError';

export const handleResult = (
  rpcResponse: RpcResponse,
  args: SendSignedTransactionArgs,
) => {
  const rpcResult = RpcTransactionResponseSchema().safeParse(
    rpcResponse.result,
  );

  if (!rpcResult.success)
    return result.err(
      createNatError({
        kind: 'Client.SendSignedTransaction.Response.InvalidSchema',
        context: { zodError: rpcResult.error },
      }),
    );

  // When tx action error happened, and tx was recorded on-chain
  if (
    typeof rpcResult.data.status === 'object' &&
    'Failure' in rpcResult.data.status &&
    'ActionError' in rpcResult.data.status.Failure
  )
    return handleActionError(
      rpcResult.data.status.Failure.ActionError,
      rpcResponse,
    );

  const output = {
    rawRpcResult: rpcResult.data, // TODO Return result without errors
  };

  return result.ok(output);
};
