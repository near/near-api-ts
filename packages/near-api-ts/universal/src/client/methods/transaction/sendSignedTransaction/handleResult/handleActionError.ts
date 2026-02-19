import { result } from '../../../../../_common/utils/result';
import { createNatError } from '../../../../../_common/natError';
import type { RpcResponse } from '../../../../../_common/schemas/zod/rpc';
import type { ActionError } from '@near-js/jsonrpc-types';
import type { SendSignedTransactionArgs } from '../../../../../../types/client/methods/transaction/sendSignedTransaction';
import { yoctoNear } from '../../../../../../index';

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
            kind: 'Client.SendSignedTransaction.Rpc.Transaction.Action.InvalidIndex', // TODO: why we return this error?
            context: { rpcResponse },
          }),
        },
      }),
    );

  if (typeof kind === 'object') {
    // General
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

    // Create Account Action
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

    // Stake Action
    if ('InsufficientStake' in kind) {
      return result.err(
        createNatError({
          kind: 'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.BelowThreshold',
          context: {
            accountId: kind.InsufficientStake.accountId,
            proposedStake: yoctoNear(kind.InsufficientStake.stake),
            minimumStake: yoctoNear(kind.InsufficientStake.minimumStake),
            actionIndex,
            transactionHash,
          },
        }),
      );
    }

    if ('TriesToStake' in kind) {
      const proposedStake = yoctoNear(kind.TriesToStake.stake);
      const totalBalance = yoctoNear(kind.TriesToStake.balance).add(
        yoctoNear(kind.TriesToStake.locked),
      );
      const missingAmount = proposedStake.sub(totalBalance);

      return result.err(
        createNatError({
          kind: 'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.Balance.TooLow',
          context: {
            accountId: kind.TriesToStake.accountId,
            proposedStake,
            totalBalance,
            missingAmount,
            actionIndex,
            transactionHash,
          },
        }),
      );
    }

    if ('TriesToUnstake' in kind) {
      return result.err(
        createNatError({
          kind: 'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.NotFound',
          context: {
            accountId: kind.TriesToUnstake.accountId,
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
      context: { cause: rpcResponse },
    }),
  );
};
