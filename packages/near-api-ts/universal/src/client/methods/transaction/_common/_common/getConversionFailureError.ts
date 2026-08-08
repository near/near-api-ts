import type { InvalidTxError } from '@near-js/jsonrpc-types';
import type { PublicKey } from '../../../../../../types/_common/crypto';
import type { ConversionFailureError } from '../../../../../../types/_common/transactionDetails/_common/_common/conversionFailureError';
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
            accessKeyContractAccountId: accessKeyError.ReceiverMismatch.akReceiver,
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
  }

  throw new Error(`Unexpected invalidTxError: ${JSON.stringify(invalidTxError)}`);
};
