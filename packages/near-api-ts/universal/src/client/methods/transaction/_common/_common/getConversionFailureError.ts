import type { InvalidTxError } from '@near-js/jsonrpc-types';
import type { PublicKey } from '../../../../../../types/_common/crypto';
import type { ConversionFailureError } from '../../../../../../types/_common/transactionDetails/_common/_common/conversionFailureError';
import { throwableGas } from '../../../../../helpers/nearGas';
import { yoctoNear } from '../../../../../helpers/tokens/nearToken';

const formErrorObject = <K, C>(kind: K, context: C) => ({ kind, context });

export const getConversionFailureError = (
  invalidTxError: InvalidTxError,
): ConversionFailureError => {
  // General
  if (invalidTxError === 'InvalidSignature') return formErrorObject('Signature.Invalid', null);

  // `check_transaction_validity_period` (`chain/chain/src/store/utils.rs`) doesn't know the
  // block: either the node has never seen it, or it is more than `transaction_validity_period`
  // blocks (100 on mainnet) behind the head.
  if (invalidTxError === 'Expired') return formErrorObject('BlockHash.Expired', null);

  // The deposits and the fees of the transaction don't add up to a u128 anymore.
  if (invalidTxError === 'CostOverflow') return formErrorObject('TransactionCost.Overflow', null);

  if (typeof invalidTxError === 'object') {
    if ('InvalidNonce' in invalidTxError)
      return formErrorObject('Nonce.Invalid', {
        transactionNonce: invalidTxError.InvalidNonce.txNonce,
        accessKeyNonce: invalidTxError.InvalidNonce.akNonce,
      });

    // Signer
    if ('SignerDoesNotExist' in invalidTxError)
      return formErrorObject('Signer.NotFound', {
        signerAccountId: invalidTxError.SignerDoesNotExist.signerId,
      });

    // The same "no account record in the trie" verdict as `SignerDoesNotExist`, reached on the
    // other code path: `SignerDoesNotExist` comes from `get_signer_and_access_key`
    // (`runtime/runtime/src/verifier.rs`), which both `send_tx` and the chunk producer run before
    // a transaction is admitted, while this one comes from `Runtime::process_transactions`
    // (`runtime/runtime/src/lib.rs`) when a transaction is already inside a chunk. A stock node
    // never lets it get that far, so it takes a chunk producer skipping runtime verification —
    // possible on a public network, and recorded on chain as a failed outcome since PV83
    // (`InvalidTxGenerateOutcomes`) rather than invalidating the whole chunk. Note the nearcore
    // doc comment ("signer_id is not a valid AccountId") describes a check deleted back when
    // `AccountId` became strictly typed: borsh rejects a malformed account id long before the
    // runtime, so the variant only ever carries the account-not-found meaning.
    if ('InvalidSignerId' in invalidTxError)
      return formErrorObject('Signer.NotFound', {
        signerAccountId: invalidTxError.InvalidSignerId.signerId,
      });

    // The signer can't cover what the transaction needs — either its cost (deposits plus fees)
    // outright, or the balance the signer account is left with can't cover its own storage
    // anymore. Both boil down to the same thing for the caller: the signer's budget is short by
    // `minimalMissingAmount`. The cost of the next attempt depends on the gas price of its
    // block, so this is only the minimal top up.
    if ('NotEnoughBalance' in invalidTxError)
      return formErrorObject('Signer.Budget.NotEnough', {
        signerAccountId: invalidTxError.NotEnoughBalance.signerId,
        minimalMissingAmount: yoctoNear(invalidTxError.NotEnoughBalance.cost).sub(
          yoctoNear(invalidTxError.NotEnoughBalance.balance),
        ),
      });

    if ('LackBalanceForState' in invalidTxError)
      return formErrorObject('Signer.Budget.NotEnough', {
        signerAccountId: invalidTxError.LackBalanceForState.signerId,
        minimalMissingAmount: yoctoNear(invalidTxError.LackBalanceForState.amount),
      });

    if ('InvalidAccessKeyError' in invalidTxError) {
      const accessKeyError = invalidTxError.InvalidAccessKeyError;

      // The key the transaction is signed with is a function-call key, and the transaction
      // carries something other than a single FunctionCall action.
      if (accessKeyError === 'RequiresFullAccess')
        return formErrorObject('Signer.AccessKey.NotFullAccess', null);

      // A function-call key can never attach a deposit, not even to a function it may call.
      if (accessKeyError === 'DepositWithFunctionCall')
        return formErrorObject('Signer.AccessKey.AttachedDeposit.NotAllowed', null);

      if (typeof accessKeyError === 'object') {
        if ('AccessKeyNotFound' in accessKeyError)
          return formErrorObject('Signer.AccessKey.NotFound', {
            signerAccountId: accessKeyError.AccessKeyNotFound.accountId,
            signerPublicKey: accessKeyError.AccessKeyNotFound.publicKey as PublicKey,
          });

        if ('ReceiverMismatch' in accessKeyError)
          return formErrorObject('Signer.AccessKey.Receiver.NotAllowed', {
            transactionReceiverAccountId: accessKeyError.ReceiverMismatch.txReceiver,
            allowedContractAccountId: accessKeyError.ReceiverMismatch.akReceiver,
          });

        if ('MethodNameMismatch' in accessKeyError)
          return formErrorObject('Signer.AccessKey.Function.NotAllowed', {
            functionName: accessKeyError.MethodNameMismatch.methodName,
          });

        // `transactionCost` is the same `total_cost` the node charges the signer balance with
        // (`Signer.Budget.NotEnough` reports it too, folded into `minimalMissingAmount`) — the
        // burnt fees plus the prepaid gas at the current gas price, plus the deposits. A
        // function-call key may not attach a deposit, but `check_and_compute_new_allowance` runs
        // before that check (`runtime/runtime/src/verifier.rs`), so a key with a deposit fails
        // here — with the deposit counted into the cost — instead of with
        // `AttachedDeposit.NotAllowed`.
        if ('NotEnoughAllowance' in accessKeyError)
          return formErrorObject('Signer.AccessKey.GasBudget.NotEnough', {
            signerAccountId: accessKeyError.NotEnoughAllowance.accountId,
            signerPublicKey: accessKeyError.NotEnoughAllowance.publicKey as PublicKey,
            gasBudget: yoctoNear(accessKeyError.NotEnoughAllowance.allowance),
            transactionCost: yoctoNear(accessKeyError.NotEnoughAllowance.cost),
          });
      }
    }

    // Actions validation — `validate_actions_with_mode`
    // (`runtime/runtime/src/action_validation.rs`) blaming either the action list as a whole
    // (`Actions.*`) or one action in it (`Action.*`).
    if ('ActionsValidation' in invalidTxError) {
      const actionsError = invalidTxError.ActionsValidation;

      // Only a FunctionCall action carries gas — `get_prepaid_gas` is zero for every other one
      // — so the sum that overflows a u64 here is theirs alone.
      if (actionsError === 'IntegerOverflow')
        return formErrorObject('Actions.FunctionCall.TotalGasLimit.Overflow', null);

      // A call with no gas could never do any work, so it is turned down before the node even
      // looks at the function name and the arguments.
      if (actionsError === 'FunctionCallZeroAttachedGas')
        return formErrorObject('Action.FunctionCall.ZeroGasLimit', null);

      // The account is gone once the deletion executes, so nothing may follow it.
      if (actionsError === 'DeleteActionMustBeFinal')
        return formErrorObject('Action.DeleteAccount.NotFinal', null);

      if (typeof actionsError === 'object') {
        if ('TotalNumberOfActionsExceeded' in actionsError)
          return formErrorObject('Actions.TooMany', {
            actionsCount: actionsError.TotalNumberOfActionsExceeded.totalNumberOfActions,
            maximumActionsCount: actionsError.TotalNumberOfActionsExceeded.limit,
          });

        // The node counts `DeployContract` and `DeployGlobalContract` actions together against
        // one `max_deploy_actions_per_receipt`.
        if ('TotalNumberOfDeployActionsExceeded' in actionsError)
          return formErrorObject('Actions.DeployContract.TooMany', {
            deployContractActionsCount:
              actionsError.TotalNumberOfDeployActionsExceeded.numberOfDeployActions,
            maximumDeployContractActionsCount:
              actionsError.TotalNumberOfDeployActionsExceeded.limit,
          });

        if ('TotalPrepaidGasExceeded' in actionsError)
          return formErrorObject('Actions.FunctionCall.TotalGasLimit.Exceeded', {
            totalGasLimit: throwableGas(actionsError.TotalPrepaidGasExceeded.totalPrepaidGas),
            maximumTotalGasLimit: throwableGas(actionsError.TotalPrepaidGasExceeded.limit),
          });

        if ('FunctionCallMethodNameLengthExceeded' in actionsError)
          return formErrorObject('Action.FunctionCall.FunctionName.TooLong', {
            functionNameLength: actionsError.FunctionCallMethodNameLengthExceeded.length,
            maximumFunctionNameLength: actionsError.FunctionCallMethodNameLengthExceeded.limit,
          });

        if ('AddKeyMethodNameLengthExceeded' in actionsError)
          return formErrorObject('Action.AddKey.AllowedFunctions.FunctionName.TooLong', {
            functionNameLength: actionsError.AddKeyMethodNameLengthExceeded.length,
            maximumFunctionNameLength: actionsError.AddKeyMethodNameLengthExceeded.limit,
          });

        // `totalSizeBytes` isn't the bytes of the names alone: the node adds a terminating byte
        // after each one before it compares the total against the limit.
        if ('AddKeyMethodNamesNumberOfBytesExceeded' in actionsError)
          return formErrorObject('Action.AddKey.AllowedFunctions.TotalSize.Exceeded', {
            totalSizeBytes: actionsError.AddKeyMethodNamesNumberOfBytesExceeded.totalNumberOfBytes,
            maximumTotalSizeBytes: actionsError.AddKeyMethodNamesNumberOfBytesExceeded.limit,
          });

        // `is_valid_staking_key` takes ed25519 keys only, and only those whose bytes decompress
        // to a torsion-free point it can turn into a ristretto one.
        if ('UnsuitableStakingKey' in actionsError)
          return formErrorObject('Action.Stake.ValidatorKey.Invalid', {
            validatorPublicKey: actionsError.UnsuitableStakingKey.publicKey as PublicKey,
          });
      }
    }
  }

  throw new Error(`Unexpected invalidTxError: ${JSON.stringify(invalidTxError)}`);
};
