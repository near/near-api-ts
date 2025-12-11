import * as z from 'zod/mini';
import { InvalidTxErrorSchema } from '@near-js/jsonrpc-types';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import type { RpcResponse } from '@common/schemas/zod/rpc';

const InvalidTransactionErrorSchema = z.object({
  TxExecutionError: z.object({
    InvalidTxError: InvalidTxErrorSchema(),
  }),
});

export const handleInvalidTransaction = (rpcResponse: RpcResponse) => {
  const invalidTransactionError = InvalidTransactionErrorSchema.safeParse(
    rpcResponse.error?.data,
  );

  if (!invalidTransactionError.success)
    return result.err(
      createNatError({
        kind: 'Client.SendSignedTransaction.Response.InvalidSchema',
        context: { zodError: invalidTransactionError.error },
      }),
    );

  const { InvalidTxError } = invalidTransactionError.data.TxExecutionError;

  if (typeof InvalidTxError === 'string') {
    if (InvalidTxError === 'Expired') {
      return result.err(
        createNatError({
          kind: 'Client.SendSignedTransaction.Rpc.Transaction.Expired',
          context: null,
        }),
      );
    }

    if (InvalidTxError === 'InvalidSignature') {
      return result.err(
        createNatError({
          kind: 'Client.SendSignedTransaction.Rpc.Transaction.Signature.Invalid',
          context: null,
        }),
      );
    }
  }

  if (typeof InvalidTxError === 'object') {
    if ('InvalidNonce' in InvalidTxError) {
      const { akNonce, txNonce } = InvalidTxError.InvalidNonce;
      return result.err(
        createNatError({
          kind: 'Client.SendSignedTransaction.Rpc.Transaction.Nonce.Invalid',
          context: {
            accessKeyNonce: akNonce,
            transactionNonce: txNonce,
          },
        }),
      );
    }

    if ('SignerDoesNotExist' in InvalidTxError) {
      return result.err(
        createNatError({
          kind: 'Client.SendSignedTransaction.Rpc.Transaction.Signer.NotFound',
          context: {
            signerAccountId: InvalidTxError.SignerDoesNotExist.signerId,
          },
        }),
      );
    }
  }

  // Stub
  return result.err(
    createNatError({
      kind: 'Client.SendSignedTransaction.Unknown',
      context: {
        cause: {
          kind: 'RpcError.Unclassified',
          rpcResponse,
        },
      },
    }),
  );
};
