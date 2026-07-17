import type { ActionError } from '@near-js/jsonrpc-types';
import { yoctoNear } from '../../../../../../index';
import type { PublicKey } from '../../../../../../types/_common/crypto';
import type { ExecutionError } from '../../../../../../types/_common/transactionDetails/processingSteps/executionSteps/executionError';
import { transformFunctionCallError } from './transformFunctionCallError/transformFunctionCallError';

export const getExecutionError = (actionError: ActionError): ExecutionError => {
  if (typeof actionError.kind === 'object') {
    const { kind } = actionError;

    // General
    if ('AccountDoesNotExist' in kind)
      return {
        kind: 'Executor.NotFound',
        context: {
          executorAccountId: kind.AccountDoesNotExist.accountId,
        },
      };

    if ('LackBalanceForState' in kind)
      return {
        kind: 'Executor.NotEnoughBalance',
        context: {
          executorAccountId: kind.LackBalanceForState.accountId,
          missingAmount: yoctoNear(kind.LackBalanceForState.amount),
        },
      };

    if ('ActorNoPermission' in kind)
      return {
        kind: 'Action.Forbidden',
        context: {
          stepCreatorAccountId: kind.ActorNoPermission.actorId,
          executorAccountId: kind.ActorNoPermission.accountId,
        },
      };

    // CreateAccount action
    if ('AccountAlreadyExists' in kind)
      return {
        kind: 'Action.CreateAccount.AlreadyExists',
        context: {
          newAccountId: kind.AccountAlreadyExists.accountId,
        },
      };

    if ('CreateAccountOnlyByRegistrar' in kind)
      return {
        kind: 'Action.CreateAccount.TopLevelNamespace',
        context: {
          newAccountId: kind.CreateAccountOnlyByRegistrar.accountId,
          creatorAccountId: kind.CreateAccountOnlyByRegistrar.predecessorId,
          registrarAccountId: kind.CreateAccountOnlyByRegistrar.registrarAccountId,
        },
      };

    if ('CreateAccountNotAllowed' in kind)
      return {
        kind: 'Action.CreateAccount.ForeignNamespace',
        context: {
          newAccountId: kind.CreateAccountNotAllowed.accountId,
          creatorAccountId: kind.CreateAccountNotAllowed.predecessorId,
        },
      };

    if ('OnlyImplicitAccountCreationAllowed' in kind)
      return {
        kind: 'Action.CreateAccount.ImplicitAccount',
        context: { newAccountId: kind.OnlyImplicitAccountCreationAllowed.accountId },
      };

    // AddKey
    if ('AddKeyAlreadyExists' in kind)
      return {
        kind: 'Action.AddKey.AlreadyExists',
        context: {
          accountId: kind.AddKeyAlreadyExists.accountId,
          publicKey: kind.AddKeyAlreadyExists.publicKey as PublicKey, // TODO validate by zod
        },
      };

    // FunctionCall action
    if ('FunctionCallError' in kind) return transformFunctionCallError(kind.FunctionCallError);

    // This error may only happen when a new receipt is created, in practice -
    // only during function call action
    // Since some errors in reality would never happen (even they are declared in nearcore),
    // and some is very old (happened only in 2021), we stringify it.
    if ('NewReceiptValidationError' in kind)
      return {
        kind: 'Action.FunctionCall.Execution.Failed',
        context: { cause: JSON.stringify(kind) },
      };

    // Stake action
    if ('InsufficientStake' in kind)
      return {
        kind: 'Action.Stake.BelowThreshold',
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
        kind: 'Action.Stake.NotEnoughBalance',
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
        kind: 'Action.Stake.NotFound',
        context: { accountId: kind.TriesToUnstake.accountId },
      };

    // DeleteKey action
    if ('DeleteKeyDoesNotExist' in kind)
      return {
        kind: 'Action.DeleteKey.NotFound',
        context: {
          accountId: kind.DeleteKeyDoesNotExist.accountId,
          publicKey: kind.DeleteKeyDoesNotExist.publicKey as PublicKey,
        },
      };

    // DeleteAccount action
    if ('DeleteAccountStaking' in kind)
      return {
        kind: 'Action.DeleteAccount.Staking',
        context: {
          accountId: kind.DeleteAccountStaking.accountId,
        },
      };

    if ('DeleteAccountWithLargeState' in kind)
      return {
        kind: 'Action.DeleteAccount.LargeState',
        context: {
          accountId: kind.DeleteAccountWithLargeState.accountId,
        },
      };
  }

  throw new Error('Unknown execution error', { cause: actionError });
};
