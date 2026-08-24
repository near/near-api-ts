import type { ActionError } from '@near-js/jsonrpc-types';
import type { PublicKey } from '../../../../../../../../types/_common/crypto';
import type { ExecutionFailureError } from '../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/executionFailureError';
import { yoctoNear } from '../../../../../../../_common/nearToken';
import { transformFunctionCallError } from './transformFunctionCallError/transformFunctionCallError';

export const getExecutionFailureError = (actionError: ActionError): ExecutionFailureError => {
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

    // ExecuteDelegation action
    // The delegation is executed on the transaction receiver account, so that account must be
    // the delegator - nearcore reports its own receiverId here, not the delegation receiver.
    if ('DelegateActionSenderDoesNotMatchTxReceiver' in kind)
      return {
        kind: 'Action.ExecuteDelegation.Executor.NotDelegator',
        context: {
          executorAccountId: kind.DelegateActionSenderDoesNotMatchTxReceiver.receiverId,
          delegatorAccountId: kind.DelegateActionSenderDoesNotMatchTxReceiver.senderId,
        },
      };

    // The delegator's key is checked the same way a transaction signer's key is, so these
    // mirror the `Signer.AccessKey.*` conversion errors - only the account they blame is the
    // delegator, and the receiver they compare against is the delegation receiver.
    if ('DelegateActionAccessKeyError' in kind) {
      const accessKeyError = kind.DelegateActionAccessKeyError;

      // The delegation is signed with a function-call key, and it carries something other than
      // a single FunctionCall action.
      if (accessKeyError === 'RequiresFullAccess')
        return {
          kind: 'Action.ExecuteDelegation.Delegator.AccessKey.NotFullAccess',
          context: null,
        };

      // A function-call key can never attach a deposit, not even to a function it may call.
      if (accessKeyError === 'DepositWithFunctionCall')
        return {
          kind: 'Action.ExecuteDelegation.Delegator.AccessKey.AttachedDeposit.NotAllowed',
          context: null,
        };

      if (typeof accessKeyError === 'object') {
        if ('AccessKeyNotFound' in accessKeyError)
          return {
            kind: 'Action.ExecuteDelegation.Delegator.AccessKey.NotFound',
            context: {
              delegatorAccountId: accessKeyError.AccessKeyNotFound.accountId,
              delegatorPublicKey: accessKeyError.AccessKeyNotFound.publicKey as PublicKey,
            },
          };

        // `txReceiver` is the delegation receiver here - the delegated actions are the ones the
        // key restricts, not the transaction the relayer wraps them into.
        if ('ReceiverMismatch' in accessKeyError)
          return {
            kind: 'Action.ExecuteDelegation.Delegator.AccessKey.Receiver.NotAllowed',
            context: {
              delegationReceiverAccountId: accessKeyError.ReceiverMismatch.txReceiver,
              allowedContractAccountId: accessKeyError.ReceiverMismatch.akReceiver,
            },
          };

        if ('MethodNameMismatch' in accessKeyError)
          return {
            kind: 'Action.ExecuteDelegation.Delegator.AccessKey.Function.NotAllowed',
            context: { functionName: accessKeyError.MethodNameMismatch.methodName },
          };

        // `NotEnoughAllowance` is left out on purpose: the relayer pays for a delegation, so
        // `validate_delegate_action_key` (`runtime/runtime/src/actions.rs`) never touches the
        // delegator key's allowance - only `verify_and_charge_tx_ephemeral`
        // (`runtime/runtime/src/verifier.rs`) does, on the transaction path.
      }
    }

    if ('DelegateActionInvalidNonce' in kind)
      return {
        kind: 'Action.ExecuteDelegation.Nonce.Invalid',
        context: {
          delegationNonce: kind.DelegateActionInvalidNonce.delegateNonce,
          accessKeyNonce: kind.DelegateActionInvalidNonce.akNonce,
        },
      };

    if ('DelegateActionNonceTooLarge' in kind)
      return {
        kind: 'Action.ExecuteDelegation.Nonce.TooLarge',
        context: {
          delegationNonce: kind.DelegateActionNonceTooLarge.delegateNonce,
          maxAllowedNonce: kind.DelegateActionNonceTooLarge.upperBound,
        },
      };
  }

  if (actionError.kind === 'DelegateActionInvalidSignature')
    return {
      kind: 'Action.ExecuteDelegation.Signature.Invalid',
      context: null,
    };

  if (actionError.kind === 'DelegateActionExpired')
    return {
      kind: 'Action.ExecuteDelegation.Expired',
      context: null,
    };

  throw new Error('Unknown execution error', { cause: actionError });
};
