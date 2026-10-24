import type { ActionError, ActionView } from '@near-js/jsonrpc-types';
import type { PublicKey } from '../../../../../../../../types/_common/crypto';
import type { ExecutionFailureError } from '../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/executionFailureError';
import type { ProtocolEra } from '../../../../../../../../types/client/methods/transaction/_common/transactionDetails/_common/_common/protocolEra';

// The failures of the ExecuteDelegation and LegacyExecuteDelegation actions - nearcore names each
// one `DelegateAction*` - or `undefined` for any other. `failedAction` is the action the error
// index points at.
export const getExecuteDelegationFailureError = (
  kind: ActionError['kind'],
  failedAction: ActionView | undefined,
  protocolEras: readonly ProtocolEra[],
): ExecutionFailureError | undefined => {
  const isDelegateV2 = typeof failedAction === 'object' && 'DelegateV2' in failedAction;

  if (isDelegateV2 && !protocolEras.includes('Legacy'))
    throw new Error('Protocol 87 refuses a new DelegateV2');

  // A NEP-611 delegation fails the way a NEP-366 one does, under the name of its action summary
  const delegation = isDelegateV2 ? 'Action.LegacyExecuteDelegation' : 'Action.ExecuteDelegation';

  if (kind === 'DelegateActionInvalidSignature')
    return {
      kind: `${delegation}.Signature.Invalid`,
      context: null,
    };

  if (kind === 'DelegateActionExpired')
    return {
      kind: `${delegation}.Expired`,
      context: null,
    };

  if (typeof kind !== 'object') return undefined;

  // The delegation is executed on the transaction receiver account, so that account must be
  // the delegator - nearcore reports its own receiverId here, not the delegation receiver.
  if ('DelegateActionSenderDoesNotMatchTxReceiver' in kind)
    return {
      kind: `${delegation}.Executor.NotAllowed`,
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

    // The delegation is signed with a `ContractFunctionCall` key, and it carries something other
    // than a single CallContractFunction action.
    if (accessKeyError === 'RequiresFullAccess')
      return {
        kind: `${delegation}.Delegator.AccessKey.NotFullAccess`,
        context: null,
      };

    // A `ContractFunctionCall` key can never attach a deposit, not even to a function it may
    // call.
    if (accessKeyError === 'DepositWithFunctionCall')
      return {
        kind: `${delegation}.Delegator.AccessKey.AttachedDeposit.NotAllowed`,
        context: null,
      };

    // The delegation takes the single nonce channel of a key, but the delegator key has nonce
    // channels - the protocol refuses a delegation signed by a key paid from its own balance
    if (accessKeyError === 'DelegateActionRequiresNonGasKey')
      return {
        kind: `${delegation}.Delegator.AccessKey.NonceChannels.NotAllowed`,
        context: null,
      };

    // The delegation names a nonce channel, which only a NEP-611 one can do, but the delegator
    // key is paid from the account balance and has none
    if (accessKeyError === 'DelegateActionRequiresGasKey')
      return {
        kind: 'Action.LegacyExecuteDelegation.Delegator.AccessKey.NonceChannels.NotFound',
        context: null,
      };

    if (typeof accessKeyError === 'object') {
      if ('AccessKeyNotFound' in accessKeyError)
        return {
          kind: `${delegation}.Delegator.AccessKey.NotFound`,
          context: {
            delegatorAccountId: accessKeyError.AccessKeyNotFound.accountId,
            delegatorPublicKey: accessKeyError.AccessKeyNotFound.publicKey as PublicKey,
          },
        };

      // `txReceiver` is the delegation receiver here - the delegated actions are the ones the
      // key restricts, not the transaction the relayer wraps them into.
      if ('ReceiverMismatch' in accessKeyError)
        return {
          kind: `${delegation}.Delegator.AccessKey.Receiver.NotAllowed`,
          context: {
            delegationReceiverAccountId: accessKeyError.ReceiverMismatch.txReceiver,
            allowedContractAccountId: accessKeyError.ReceiverMismatch.akReceiver,
          },
        };

      if ('MethodNameMismatch' in accessKeyError)
        return {
          kind: `${delegation}.Delegator.AccessKey.Function.NotAllowed`,
          context: { functionName: accessKeyError.MethodNameMismatch.methodName },
        };

      // `NotEnoughAllowance` is left out on purpose: the relayer pays for a delegation, so
      // `validate_delegate_action_key` (`runtime/runtime/src/actions.rs`) never touches the
      // delegator key's allowance - only `verify_and_charge_tx_ephemeral`
      // (`runtime/runtime/src/verifier.rs`) does, on the transaction path.
    }
  }

  // The delegation names a nonce channel past the last one of the delegator's gas key -
  // `nonceIndex` is 0-based, like our `nonceChannelId`. Only a NEP-611 one names a channel.
  if ('DelegateActionInvalidNonceIndex' in kind)
    return {
      kind: 'Action.LegacyExecuteDelegation.NonceChannel.NotFound',
      context: {
        delegationNonceChannelId: kind.DelegateActionInvalidNonceIndex.nonceIndex,
        accessKeyChannelCount: kind.DelegateActionInvalidNonceIndex.numNonces,
      },
    };

  if ('DelegateActionInvalidNonce' in kind)
    return {
      kind: `${delegation}.Nonce.Invalid`,
      context: {
        delegationNonce: kind.DelegateActionInvalidNonce.delegateNonce,
        accessKeyNonce: kind.DelegateActionInvalidNonce.akNonce,
      },
    };

  if ('DelegateActionNonceTooLarge' in kind)
    return {
      kind: `${delegation}.Nonce.TooLarge`,
      context: {
        delegationNonce: kind.DelegateActionNonceTooLarge.delegateNonce,
        maxAllowedNonce: kind.DelegateActionNonceTooLarge.upperBound,
      },
    };
};
