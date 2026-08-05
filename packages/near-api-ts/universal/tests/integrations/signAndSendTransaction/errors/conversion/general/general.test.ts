import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { blockHashExpired } from './blockHashExpired';
import { nonceInvalid } from './nonceInvalid';
import { nonceTooLarge } from './nonceTooLarge';
import { signatureInvalid } from './signatureInvalid';
import { transactionCostNotCovered } from './transactionCostNotCovered';
import { transactionCostOverflow } from './transactionCostOverflow';
import { transactionSizeExceeded } from './transactionSizeExceeded';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

/**
 * The `InvalidTxError` variants that blame the transaction as a whole — not the signer or its
 * access key (the `signer` group), not the action list (`ActionsValidationError`), not a shard.
 * Every one of them that a client can actually reach is mapped to a
 * `GeneralConversionErrorRegistry` kind; the two cases below it are registered as skipped
 * because the node never answers with them over JSON-RPC.
 *
 * The variants the enum has left over never reach a client talking to a stock node:
 *
 * - `InvalidReceiverId` — nothing in 2.13.2 constructs it anymore; only its `Display` arm is
 *   left in `core/primitives/src/errors.rs`.
 * - `InvalidTransactionVersion` — `check_valid_for_config` gates transactions that need
 *   `GasKeys`, `StrictNonce` or `PostQuantumSignatures`; all three are live from protocol
 *   version 85 and the sandbox runs 86, so no transaction can be too new for it.
 * - `StorageError` — an internal trie or database failure of the node itself.
 * - `ShardCongested` / `ShardStuck` — both need a shard to be in a state a healthy sandbox
 *   never reaches on its own, so they live in the `shard` group, which builds it.
 * - `InvalidChain` — needs a node whose head trails the block the transaction was built on,
 *   which `blockHashNotAncestor.test.ts` arranges.
 * - `InvalidNonceIndex`, `NotEnoughGasKeyBalance`, `NotEnoughBalanceForDeposit` — produced
 *   only by `verify_and_charge_gas_key_tx_ephemeral`, i.e. for transactions signed with a gas
 *   key, which the library doesn't build.
 */
describe('signAndSendTransaction › General conversion errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it(
    'fails with Signature.Invalid when the signature does not match the signer public key',
    signatureInvalid(context),
  );

  it('fails with Nonce.Invalid when the nonce is already used', nonceInvalid(context));

  it(
    'fails with BlockHash.Expired when the block hash is not on the chain anymore',
    blockHashExpired(context),
  );

  it(
    'fails with TransactionCost.NotCovered when the signer cannot cover the transaction cost',
    transactionCostNotCovered(context),
  );

  it(
    'fails with TransactionCost.Overflow when the transaction cost does not fit u128',
    transactionCostOverflow(context),
  );

  // Skipped: a transaction big enough to fail the check no longer fits into the request
  // body the node accepts, so it can't be delivered at all — see `transactionSizeExceeded`.
  it.skip(
    'fails with TransactionSizeExceeded when the transaction is over the size limit',
    transactionSizeExceeded(context),
  );

  // Skipped: the node skips the nonce upper bound check while it validates an incoming
  // transaction, so the error never reaches the client — see `nonceTooLarge`.
  it.skip(
    'fails with NonceTooLarge when the nonce is above the upper bound of the current block',
    nonceTooLarge(context),
  );
});
