import { InvalidTxErrorSchema } from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import type { Base64String, ResultErr } from '../../../../../types/_common/common';
import type { ConversionFailureKind } from '../../../../../types/_common/transactionDetails/_common/_common/conversionFailureError';
import { createNatError, NatError, resultNatError } from '../../../../_common/natError';
import {
  type BaseRpcResponse,
  createHandlerErrorZodSchema,
  InternalErrorZodSchema,
  RequestValidationErrorZodSchema,
} from '../../../../_common/schemas/zod/rpc/rpcResponse';
import { getConversionFailureError } from '../_common/_common/getConversionFailureError';

const TimeoutErrorZodSchema = createHandlerErrorZodSchema({
  cause: z.object({
    name: z.literal('TIMEOUT_ERROR'),
    info: z.unknown(),
  }),
  data: z.optional(z.unknown()),
});
type TimeoutError = z.infer<typeof TimeoutErrorZodSchema>;

const InvalidTransactionErrorZodSchema = createHandlerErrorZodSchema({
  cause: z.object({
    name: z.literal('INVALID_TRANSACTION'),
    info: z.unknown(),
  }),
  data: z.object({
    TxExecutionError: z.object({
      InvalidTxError: InvalidTxErrorSchema(),
    }),
  }),
});
type InvalidTransactionError = z.infer<typeof InvalidTransactionErrorZodSchema>;

const RpcErrorZodSchema = z.union([
  RequestValidationErrorZodSchema,
  TimeoutErrorZodSchema,
  InvalidTransactionErrorZodSchema,
  InternalErrorZodSchema,
]);
type RpcError = z.infer<typeof RpcErrorZodSchema>;

const isTimeoutError = (rpcError: RpcError): rpcError is TimeoutError =>
  rpcError.name === 'HANDLER_ERROR' && rpcError.cause.name === 'TIMEOUT_ERROR';

const isInvalidTransaction = (rpcError: RpcError): rpcError is InvalidTransactionError =>
  rpcError.name === 'HANDLER_ERROR' && rpcError.cause.name === 'INVALID_TRANSACTION';

export const handleRpcError = (
  rpcResponse: BaseRpcResponse,
  signedTransactionBorsh64: Base64String,
): ResultErr<
  | NatError<'Client.SendSignedTransaction.Exhausted'>
  | NatError<'Client.SendSignedTransaction.Rpc.Timeout'>
  | NatError<'Client.SendSignedTransaction.Internal'>
  | NatError<`Client.SendSignedTransaction.Rpc.${ConversionFailureKind}`>
> => {
  const rpcError = RpcErrorZodSchema.safeParse(rpcResponse.error);

  if (!rpcError.success)
    return resultNatError('Client.SendSignedTransaction.Exhausted', {
      lastError: createNatError({
        kind: 'SendRequest.Attempt.Response.InvalidSchema',
        context: { zodError: rpcError.error },
      }),
    });

  if (isTimeoutError(rpcError.data))
    return resultNatError(`Client.SendSignedTransaction.Rpc.Timeout`, null);

  if (isInvalidTransaction(rpcError.data)) {
    const error = getConversionFailureError(rpcError.data.data.TxExecutionError.InvalidTxError);
    return resultNatError(`Client.SendSignedTransaction.Rpc.${error.kind}`, {
      info: error.context,
      signedTransactionBorsh64,
    });
  }

  return resultNatError('Client.SendSignedTransaction.Internal', { cause: rpcResponse });
};
