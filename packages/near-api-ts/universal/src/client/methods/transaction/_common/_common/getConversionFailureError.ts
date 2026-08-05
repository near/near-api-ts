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

  // The same check knows the block but can't reach it from the head — it sits on a fork, or
  // above the head of a node that is still catching up.
  if (invalidTxError === 'InvalidChain') return formErrorObject('BlockHash.NotAncestor', null);

  // The deposits and the fees of the transaction don't add up to a u128 anymore.
  if (invalidTxError === 'CostOverflow') return formErrorObject('TransactionCost.Overflow', null);

  if (typeof invalidTxError === 'object') {
    if ('InvalidNonce' in invalidTxError)
      return formErrorObject('Nonce.Invalid', {
        transactionNonce: invalidTxError.InvalidNonce.txNonce,
        accessKeyNonce: invalidTxError.InvalidNonce.akNonce,
      });

    if ('NotEnoughBalance' in invalidTxError)
      return formErrorObject('TransactionCost.NotCovered', {
        signerAccountId: invalidTxError.NotEnoughBalance.signerId,
        transactionCost: yoctoNear(invalidTxError.NotEnoughBalance.cost),
        // What the balance was short of the cost the node quoted. The cost of the next attempt
        // depends on the gas price of its block, so this is only the minimal top up.
        minimalMissingAmount: yoctoNear(invalidTxError.NotEnoughBalance.cost).sub(
          yoctoNear(invalidTxError.NotEnoughBalance.balance),
        ),
      });

    // Signer
    if ('SignerDoesNotExist' in invalidTxError)
      return formErrorObject('Signer.NotFound', {
        signerAccountId: invalidTxError.SignerDoesNotExist.signerId,
      });

    if ('LackBalanceForState' in invalidTxError)
      return formErrorObject('Signer.StorageUsage.NotCovered', {
        signerAccountId: invalidTxError.LackBalanceForState.signerId,
        missingAmount: yoctoNear(invalidTxError.LackBalanceForState.amount),
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
        // (`TransactionCost.NotCovered` reports it too) — the burnt fees plus the prepaid gas at
        // the current gas price, plus the deposits. A function-call key may not attach a deposit,
        // but `check_and_compute_new_allowance` runs before that check
        // (`runtime/runtime/src/verifier.rs`), so a key with a deposit fails here — with the
        // deposit counted into the cost — instead of with `AttachedDeposit.NotAllowed`.
        if ('NotEnoughAllowance' in accessKeyError)
          return formErrorObject('Signer.AccessKey.GasBudget.NotEnough', {
            signerAccountId: accessKeyError.NotEnoughAllowance.accountId,
            signerPublicKey: accessKeyError.NotEnoughAllowance.publicKey as PublicKey,
            gasBudget: yoctoNear(accessKeyError.NotEnoughAllowance.allowance),
            transactionCost: yoctoNear(accessKeyError.NotEnoughAllowance.cost),
          });
      }
    }

    // Shard
    // `shard_accepts_transactions` (`core/primitives/src/congestion_info.rs`) turns the incoming
    // receipts, the outgoing ones, the memory they hold and the missed chunks of the receiver
    // shard into four fractions of their limits, and rejects the transaction once the largest of
    // them reaches `reject_tx_congestion_threshold` (0.8). `congestionLevel` is that largest
    // fraction, which here is one of the first three — the node reports the missed chunks as
    // `Shard.Stuck` instead.
    if ('ShardCongested' in invalidTxError)
      return formErrorObject('Shard.Congested', {
        shardId: invalidTxError.ShardCongested.shardId,
        congestionLevel: invalidTxError.ShardCongested.congestionLevel,
      });

    // The same check when the missed chunks are the largest fraction: the shard hasn't included
    // a chunk for `missedChunksCount` blocks out of the `max_congestion_missed_chunks` (125) it
    // takes to be fully congested, so it isn't working through a backlog — it isn't making
    // progress at all.
    if ('ShardStuck' in invalidTxError)
      return formErrorObject('Shard.Stuck', {
        shardId: invalidTxError.ShardStuck.shardId,
        missedChunksCount: invalidTxError.ShardStuck.missedChunks,
      });
  }

  throw new Error(`Unexpected invalidTxError: ${JSON.stringify(invalidTxError)}`);
};
