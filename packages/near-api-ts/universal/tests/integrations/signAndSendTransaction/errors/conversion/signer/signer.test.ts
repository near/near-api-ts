import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { attachedDepositNotAllowed } from './accessKey/attachedDepositNotAllowed';
import { functionNotAllowed } from './accessKey/functionNotAllowed';
import { gasBudgetNotEnough } from './accessKey/gasBudgetNotEnough';
import { notFound as accessKeyNotFound } from './accessKey/notFound';
import { notFullAccess } from './accessKey/notFullAccess';
import { receiverNotAllowed } from './accessKey/receiverNotAllowed';
import { budgetNotEnough } from './budgetNotEnough/budgetNotEnough';
import { budgetNotEnoughStorage } from './budgetNotEnough/budgetNotEnoughStorage';
import { notFound } from './notFound';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

/**
 * Everything the node rejects because of who signs the transaction: the signer account itself,
 * and the access key the transaction is signed with. The account cases come straight from
 * `InvalidTxError`, the key cases from the `InvalidAccessKeyError` it wraps — every variant of
 * both that a client can actually reach is mapped to a `SignerErrorRegistry` kind.
 *
 * `Signer.Budget.NotEnough` covers two `InvalidTxError` variants at once: `NotEnoughBalance`
 * (the signer can't cover the transaction cost outright — `budgetNotEnough`) and
 * `LackBalanceForState` (the signer's balance after the transaction can't cover its own storage
 * anymore — `budgetNotEnoughStorage`). Both boil down to the same thing for the caller, so they
 * share a kind and only differ in how `minimalMissingAmount` gets computed.
 *
 * The variants the two enums have left over never reach a client talking to a stock node:
 *
 * - `InvalidSignerId` — the account-not-found error of the chunk application path
 *   (`Runtime::apply`, `runtime/runtime/src/lib.rs`), for a transaction that is already inside
 *   a chunk. Everything that goes through `send_tx` is checked against the state first and
 *   comes back as `SignerDoesNotExist`, i.e. `Signer.NotFound`.
 * - `DelegateActionRequiresGasKey` / `DelegateActionRequiresNonGasKey` — they decide which kind
 *   of key may sign a delegate action, and the library doesn't build delegate actions yet.
 */
describe('signAndSendTransaction › Signer conversion errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('fails with Signer.NotFound when the signer account does not exist', notFound(context));

  it(
    'fails with Signer.Budget.NotEnough when the signer cannot cover the transaction cost',
    budgetNotEnough(context),
  );

  it(
    'fails with Signer.Budget.NotEnough when the signer can no longer pay for its storage',
    budgetNotEnoughStorage(context),
  );

  it(
    'fails with Signer.AccessKey.NotFound when the signer public key is not attached to the account',
    accessKeyNotFound(context),
  );

  it(
    'fails with Signer.AccessKey.NotFullAccess when the action is not a function call',
    notFullAccess(context),
  );

  it(
    'fails with Signer.AccessKey.Receiver.NotAllowed when the receiver is not the key contract',
    receiverNotAllowed(context),
  );

  it(
    'fails with Signer.AccessKey.Function.NotAllowed when the function is not allowed by the key',
    functionNotAllowed(context),
  );

  it(
    'fails with Signer.AccessKey.AttachedDeposit.NotAllowed when the function call carries a deposit',
    attachedDepositNotAllowed(context),
  );

  it(
    'fails with Signer.AccessKey.GasBudget.NotEnough when the gas budget is below the transaction cost',
    gasBudgetNotEnough(context),
  );
});
