import { RpcTransactionResponseSchema } from '@near-js/jsonrpc-types';
import type { RpcResponse } from '../../../../../_common/schemas/zod/rpc';
import { result } from '../../../../../_common/utils/result';
import { createNatError } from '../../../../../_common/natError';
import type { SendSignedTransactionArgs } from '../../../../../../types/client/methods/transaction/sendSignedTransaction';
import { handleActionError } from './handleActionError';

export const handleResult = (
  rpcResponse: RpcResponse,
  inputArgs: SendSignedTransactionArgs,
) => {
  const rpcResult = RpcTransactionResponseSchema().safeParse(
    rpcResponse.result,
  );

  if (!rpcResult.success)
    return result.err(
      createNatError({
        kind: 'Client.SendSignedTransaction.SendRequest.Failed',
        context: {
          cause: createNatError({
            kind: 'Client.Transport.SendRequest.Response.Result.InvalidSchema',
            context: { zodError: rpcResult.error },
          }),
        },
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
      inputArgs,
    );

  const output = {
    rawRpcResult: rpcResult.data, // TODO Return result type without errors
  };

  return result.ok(output);
};
