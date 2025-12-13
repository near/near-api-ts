import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import type { RpcResponse } from '@common/schemas/zod/rpc';
import type { ActionError } from '@near-js/jsonrpc-types';
import type { SendSignedTransactionArgs } from 'nat-types/client/methods/transaction/sendSignedTransaction';

export const handleActionError = (
  actionError: ActionError,
  rpcResponse: RpcResponse,
  inputArgs: SendSignedTransactionArgs,
) => {
  const { transactionHash } = inputArgs.signedTransaction;
  const { kind, index: actionIndex } = actionError;

  // Action index is not defined if ActionError.kind is `ActionErrorKind::LackBalanceForState`;
  // for all other cases it should be present;
  if (typeof actionIndex !== 'number')
    return result.err(
      createNatError({
        kind: 'Client.SendSignedTransaction.Internal',
        context: {
          cause: createNatError({
            kind: 'Client.SendSignedTransaction.Rpc.Transaction.Action.InvalidIndex',
            context: { rpcResponse },
          }),
        },
      }),
    );

  if (typeof kind === 'object') {
    if ('AccountAlreadyExists' in kind) {
      return result.err(
        createNatError({
          kind: 'Client.SendSignedTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist',
          context: {
            accountId: kind.AccountAlreadyExists.accountId,
            actionIndex,
            transactionHash,
          },
        }),
      );
    }

    if ('AccountDoesNotExist' in kind) {
      return result.err(
        createNatError({
          kind: 'Client.SendSignedTransaction.Rpc.Transaction.Receiver.NotFound',
          context: {
            receiverAccountId: kind.AccountDoesNotExist.accountId,
            actionIndex,
            transactionHash,
          },
        }),
      );
    }
  }

  return result.err(
    createNatError({
      kind: 'Client.SendSignedTransaction.Internal',
      context: {
        cause: createNatError({
          kind: 'Client.SendSignedTransaction.Rpc.Unclassified',
          context: { rpcResponse },
        }),
      },
    }),
  );
};
