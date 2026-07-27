import * as z from 'zod/mini';
import { createNatError, resultNatError } from '../../../../_common/natError';
import { CryptoHashZodSchema } from '../../../../_common/schemas/zod/common/cryptoHash';
import {
  type BaseRpcResponse,
  createHandlerErrorZodSchema,
  InternalErrorZodSchema,
  RequestValidationErrorZodSchema,
} from '../../../../_common/schemas/zod/rpc/rpcResponse';

const UnknownTransactionErrorZodSchema = createHandlerErrorZodSchema({
  cause: z.object({
    name: z.literal('UNKNOWN_TRANSACTION'),
    info: z.object({
      requestedTransactionHash: CryptoHashZodSchema,
    }),
  }),
  data: z.optional(z.unknown()),
});

const RpcErrorZodSchema = z.union([
  UnknownTransactionErrorZodSchema,
  RequestValidationErrorZodSchema,
  InternalErrorZodSchema,
]);

export const handleRpcError = (rpcResponse: BaseRpcResponse) => {
  const rpcError = RpcErrorZodSchema.safeParse(rpcResponse.error);

  if (!rpcError.success)
    return resultNatError('Client.GetTransactionResult.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcError.error },
      }),
    });

  const { name, cause } = rpcError.data;

  if (name === 'HANDLER_ERROR') {
    if (cause.name === 'UNKNOWN_TRANSACTION')
      return resultNatError('Client.GetTransactionResult.Rpc.Transaction.NotFound', {
        transactionHash: cause.info.requestedTransactionHash.cryptoHash,
      });
  }

  return resultNatError('Client.GetTransactionResult.Internal', { cause: rpcResponse });
};
