import type { ActionError, ActionView } from '@near-js/jsonrpc-types';
import type { PublicKey } from '../../../../../../../../types/_common/crypto';
import type {
  ExecutionFailureError,
  ExecutionFailureErrorOfEra,
} from '../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/executionFailureError';
import type { ProtocolEra } from '../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/protocolEra';
import { yoctoNear } from '../../../../../../../_common/nearToken';
import { getExecuteDelegationFailureError } from './getExecuteDelegationFailureError';
import { transformFunctionCallError } from './transformFunctionCallError/transformFunctionCallError';

// `failedReceiptActions` are the actions of the receipt that failed - `actionError.index` points into them
const toExecutionFailureError = (
  actionError: ActionError,
  failedReceiptActions: ActionView[],
  protocolEras: readonly ProtocolEra[],
): ExecutionFailureError => {
  const failedAction =
    typeof actionError.index === 'number' ? failedReceiptActions[actionError.index] : undefined;

  const executeDelegationFailureError = getExecuteDelegationFailureError(
    actionError.kind,
    failedAction,
    protocolEras,
  );
  if (executeDelegationFailureError) return executeDelegationFailureError;

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
        kind: 'Executor.Budget.NotEnough',
        context: {
          executorAccountId: kind.LackBalanceForState.accountId,
          minimalMissingAmount: yoctoNear(kind.LackBalanceForState.amount),
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

    // CreateSubAccount action
    if ('AccountAlreadyExists' in kind)
      return {
        kind: 'Action.CreateSubAccount.AlreadyExists',
        context: {
          newAccountId: kind.AccountAlreadyExists.accountId,
        },
      };

    if ('CreateAccountOnlyByRegistrar' in kind)
      return {
        kind: 'Action.CreateSubAccount.TopLevelNamespace',
        context: {
          newAccountId: kind.CreateAccountOnlyByRegistrar.accountId,
          creatorAccountId: kind.CreateAccountOnlyByRegistrar.predecessorId,
          registrarAccountId: kind.CreateAccountOnlyByRegistrar.registrarAccountId,
        },
      };

    if ('CreateAccountNotAllowed' in kind)
      return {
        kind: 'Action.CreateSubAccount.ForeignNamespace',
        context: {
          newAccountId: kind.CreateAccountNotAllowed.accountId,
          creatorAccountId: kind.CreateAccountNotAllowed.predecessorId,
        },
      };

    if ('OnlyImplicitAccountCreationAllowed' in kind)
      return {
        kind: 'Action.CreateSubAccount.ImplicitAccount',
        context: { newAccountId: kind.OnlyImplicitAccountCreationAllowed.accountId },
      };

    // AddKey
    if ('AddKeyAlreadyExists' in kind)
      return {
        kind: 'Action.AddAccessKey.AlreadyExists',
        context: {
          accountId: kind.AddKeyAlreadyExists.accountId,
          publicKey: kind.AddKeyAlreadyExists.publicKey as PublicKey, // TODO validate by zod
        },
      };

    // CallContractFunction action
    if ('FunctionCallError' in kind) return transformFunctionCallError(kind.FunctionCallError);

    // This error may only happen when a new receipt is created, in practice -
    // only during function call action
    // Since some errors in reality would never happen (even they are declared in nearcore),
    // and some is very old (happened only in 2021), we stringify it.
    if ('NewReceiptValidationError' in kind)
      return {
        kind: 'Action.CallContractFunction.Execution.Failed',
        context: { cause: JSON.stringify(kind) },
      };

    // Stake action
    if ('InsufficientStake' in kind)
      return {
        kind: 'Action.Stake.ProposedStake.BelowThreshold',
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
        kind: 'Action.Stake.TotalBalance.NotEnough',
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
        kind: 'Action.Stake.ValidatorStake.AlreadyZero',
        context: { accountId: kind.TriesToUnstake.accountId },
      };

    // DeleteAccessKey action
    if ('DeleteKeyDoesNotExist' in kind)
      return {
        kind: 'Action.DeleteAccessKey.NotFound',
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

    // PinGlobalContract / LinkGlobalContract actions
    // Nearcore executes both as one `UseGlobalContract`, so it has one error for the two - the
    // identifier it blames is the one the action pointed the account at.
    if ('GlobalContractDoesNotExist' in kind) {
      const { identifier } = kind.GlobalContractDoesNotExist;

      return 'hash' in identifier
        ? {
            kind: 'Action.PinGlobalContract.GlobalContract.NotFound',
            context: { globalContractWasmHash: identifier.hash },
          }
        : {
            kind: 'Action.LinkGlobalContract.GlobalContract.NotFound',
            context: { globalContractAccountId: identifier.accountId },
          };
    }

    // TopUpAccessKeyBalance / WithdrawAccessKeyBalance actions
    // Nearcore executes them as `TransferToGasKey` / `WithdrawFromGasKey` and answers both with one
    // `GasKeyDoesNotExist`, so the action the error index points at is what tells them apart.
    if ('GasKeyDoesNotExist' in kind) {
      const context = {
        accountId: kind.GasKeyDoesNotExist.accountId,
        publicKey: kind.GasKeyDoesNotExist.publicKey as PublicKey, // TODO validate by zod
      };
      if (typeof failedAction === 'object' && 'TransferToGasKey' in failedAction)
        return { kind: 'Action.TopUpAccessKeyBalance.Balance.NotFound', context };

      if (typeof failedAction === 'object' && 'WithdrawFromGasKey' in failedAction)
        return { kind: 'Action.WithdrawAccessKeyBalance.Balance.NotFound', context };
    }

    if ('InsufficientGasKeyBalance' in kind) {
      const keyBalance = yoctoNear(kind.InsufficientGasKeyBalance.balance);
      const withdrawalAmount = yoctoNear(kind.InsufficientGasKeyBalance.required);

      return {
        kind: 'Action.WithdrawAccessKeyBalance.Balance.NotEnough',
        context: {
          accountId: kind.InsufficientGasKeyBalance.accountId,
          publicKey: kind.InsufficientGasKeyBalance.publicKey as PublicKey, // TODO validate by zod
          keyBalance,
          withdrawalAmount,
          excessAmount: withdrawalAmount.sub(keyBalance),
        },
      };
    }
  }

  throw new Error('Unknown execution error', { cause: actionError });
};

// `protocolEras` are the eras the details may hold. Without `'Legacy'` the conversion throws on
// the failure of what the current protocol refuses, so the error is of `PE` - hence this cast.
export const getExecutionFailureError = <PE extends ProtocolEra>(
  actionError: ActionError,
  failedReceiptActions: ActionView[],
  protocolEras: PE[],
): ExecutionFailureErrorOfEra<PE> =>
  toExecutionFailureError(
    actionError,
    failedReceiptActions,
    protocolEras,
  ) as ExecutionFailureErrorOfEra<PE>;
