import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { costOverflow } from './costOverflow';
import { expired } from './expired';
import { lackBalanceForState } from './lackBalanceForState';
import { nonceInvalid } from './nonceInvalid';
import { nonceTooLarge } from './nonceTooLarge';
import { signatureInvalid } from './signatureInvalid';
import { signerNotEnoughBalance } from './signerNotEnoughBalance';
import { signerNotFound } from './signerNotFound';
import { transactionSizeExceeded } from './transactionSizeExceeded';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

/**
 * The `InvalidTxError` variants that don't belong to `InvalidAccessKeyError` or
 * `ActionsValidationError`. The first group is already mapped to our own errors, the rest
 * still arrives as the raw nearcore payload — see `assertUnmappedInvalidTxError`.
 *
 * The variants the enum has left over never reach a client talking to a stock node:
 *
 * - `InvalidSignerId` — the account-not-found error of the chunk application path
 *   (`Runtime::apply`, `runtime/runtime/src/lib.rs`), for a transaction that is already inside
 *   a chunk. Everything that goes through `send_tx` is checked against the state first and
 *   comes back as `SignerDoesNotExist` instead — the case right above.
 * - `InvalidReceiverId` — nothing in 2.13.2 constructs it anymore; only its `Display` arm is
 *   left in `core/primitives/src/errors.rs`.
 * - `InvalidTransactionVersion` — `check_valid_for_config` gates transactions that need
 *   `GasKeys`, `StrictNonce` or `PostQuantumSignatures`; all three are live from protocol
 *   version 85 and the sandbox runs 86, so no transaction can be too new for it.
 * - `StorageError` — an internal trie or database failure of the node itself.
 * - `ShardCongested` / `ShardStuck` — both need a shard to be in a state a healthy sandbox
 *   never reaches on its own, so they live in the `congestion` group, which builds it.
 * - `InvalidChain` — needs a node whose head trails the block the transaction was built on,
 *   which `invalidChain.test.ts` arranges.
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

  // Mapped errors ---------------------------------------------------------------------

  it(
    'fails with Signature.Invalid when the signature does not match the signer public key',
    signatureInvalid(context),
  );

  it('fails with Nonce.Invalid when the nonce is already used', nonceInvalid(context));

  it('fails with Expired when the block hash is not on the chain anymore', expired(context));

  it('fails with Signer.NotFound when the signer account does not exist', signerNotFound(context));

  it(
    'fails with Signer.NotEnoughBalance when the signer cannot cover the transaction cost',
    signerNotEnoughBalance(context),
  );

  // Unmapped errors -------------------------------------------------------------------

  it('fails with CostOverflow when the transaction cost does not fit u128', costOverflow(context));

  it(
    'fails with LackBalanceForState when the signer can no longer pay for its storage',
    lackBalanceForState(context),
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
