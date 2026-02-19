import { InvalidTxErrorSchema } from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import { yoctoNear } from '../../../../../../index';
import { createNatError } from '../../../../../_common/natError';
import type { RpcResponse } from '../../../../../_common/schemas/zod/rpc';
import { result } from '../../../../../_common/utils/result';

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
        kind: 'Client.SendSignedTransaction.Exhausted',
        context: {
          lastError: createNatError({
            kind: 'SendRequest.Attempt.Response.InvalidSchema',
            context: { zodError: invalidTransactionError.error },
          }),
        },
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

    if ('NotEnoughBalance' in InvalidTxError) {
      const { signerId, cost } = InvalidTxError.NotEnoughBalance;
      return result.err(
        createNatError({
          kind: 'Client.SendSignedTransaction.Rpc.Transaction.Signer.Balance.TooLow',
          context: {
            transactionCost: yoctoNear(cost),
            signerAccountId: signerId,
          },
        }),
      );
    }
  }

  // Stub
  return result.err(
    createNatError({
      kind: 'Client.SendSignedTransaction.Internal',
      context: { cause: rpcResponse },
    }),
  );
};
