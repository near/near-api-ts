import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import type { RpcResponse } from '@common/schemas/zod/rpc';
import type { ActionError } from '@near-js/jsonrpc-types';

export const handleActionError = (
  actionError: ActionError,
  rpcResponse: RpcResponse,
) => {
  const { kind, index: actionIndex } = actionError;

  // Action index is not defined if ActionError.kind is `ActionErrorKind::LackBalanceForState`;
  // for all other cases it should be present;
  if (typeof actionIndex !== 'number')
    return result.err(
      createNatError({
        kind: 'Client.SendSignedTransaction.Unknown',
        context: {
          cause: {
            kind: 'Transaction.Action.InvalidIndex',
            actionIndex,
          },
        },
      }),
    );

  if (typeof kind === 'object') {
    if ('AccountAlreadyExists' in kind) {
      return result.err(
        createNatError({
          kind: 'Client.SendSignedTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist',
          context: {
            actionIndex,
            accountId: kind.AccountAlreadyExists.accountId,
          },
        }),
      );
    }
  }

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
