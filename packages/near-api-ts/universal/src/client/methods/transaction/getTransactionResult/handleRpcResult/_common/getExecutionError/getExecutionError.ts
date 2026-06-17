import type { ActionError } from '@near-js/jsonrpc-types';
import { yoctoNear } from '../../../../../../../../index';
import type { ExecutionError } from '../../../../../../../../types/_common/transactionDetails/processingSteps/executionSteps/executionError';

export const getExecutionError = (actionError: ActionError): ExecutionError => {
  if (typeof actionError.kind === 'object') {
    const { kind } = actionError;

    // Executor-related
    if ('AccountDoesNotExist' in kind)
      return {
        kind: 'Executor.NotFound',
        context: { accountId: kind.AccountDoesNotExist.accountId },
      };

    if ('LackBalanceForState' in kind)
      return {
        kind: 'Executor.StorageDeposit.TooLow',
        context: {
          accountId: kind.LackBalanceForState.accountId,
          missingAmount: yoctoNear(kind.LackBalanceForState.amount),
        },
      };

    // CreateAccount action
    if ('AccountAlreadyExists' in kind)
      return {
        kind: 'CreateAccount.AlreadyExist',
        context: { newAccountId: kind.AccountAlreadyExists.accountId },
      };

    if ('CreateAccountOnlyByRegistrar' in kind)
      return {
        kind: 'CreateAccount.TopLevelNamespace',
        context: {
          newAccountId: kind.CreateAccountOnlyByRegistrar.accountId,
          creatorAccountId: kind.CreateAccountOnlyByRegistrar.predecessorId,
          registrarAccountId: kind.CreateAccountOnlyByRegistrar.registrarAccountId,
        },
      };

    if ('CreateAccountNotAllowed' in kind)
      return {
        kind: 'CreateAccount.ForeignNamespace',
        context: {
          newAccountId: kind.CreateAccountNotAllowed.accountId,
          creatorAccountId: kind.CreateAccountNotAllowed.predecessorId,
        },
      };

    if ('OnlyImplicitAccountCreationAllowed' in kind)
      return {
        kind: 'CreateAccount.ImplicitAccount',
        context: { newAccountId: kind.OnlyImplicitAccountCreationAllowed.accountId },
      };

    // Stake action
    if ('InsufficientStake' in kind)
      return {
        kind: 'Stake.BelowThreshold',
        context: {
          accountId: kind.InsufficientStake.accountId,
          proposedStake: yoctoNear(kind.InsufficientStake.stake),
          minimumStake: yoctoNear(kind.InsufficientStake.minimumStake),
        },
      };

    if ('TriesToStake' in kind) {
      const proposedStake = yoctoNear(kind.TriesToStake.stake);
      const totalBalance = yoctoNear(kind.TriesToStake.balance).add(
        yoctoNear(kind.TriesToStake.locked),
      );
      const missingAmount = proposedStake.sub(totalBalance);

      return {
        kind: 'Stake.Balance.TooLow',
        context: {
          accountId: kind.TriesToStake.accountId,
          proposedStake,
          totalBalance,
          missingAmount,
        },
      };
    }

    if ('TriesToUnstake' in kind)
      return {
        kind: 'Stake.NotFound',
        context: { accountId: kind.TriesToUnstake.accountId },
      };
  }

  throw new Error('Unknown execution error', { cause: actionError });
};
