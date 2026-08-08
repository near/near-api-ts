import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { deployContractTooMany } from './deployContract/tooMany';
import { totalGasLimitExceeded } from './functionCall/totalGasLimitExceeded';
import { totalGasLimitOverflow } from './functionCall/totalGasLimitOverflow';
import { tooMany } from './tooMany';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

/**
 * The `ActionsValidationErrorRegistry` half of `InvalidTxError::ActionsValidation`: the kinds
 * that blame the action list as a whole rather than one action in it. The node raises them in
 * `validate_actions_with_mode` (`runtime/runtime/src/action_validation.rs`) around the loop over
 * the actions — the counts before it, the total gas after it — while everything raised inside
 * the loop belongs to the sibling `action` group.
 *
 * The cases follow the order the node checks them in, because an earlier check hides a later one.
 *
 * One variant of this half stays unmapped: `UnsupportedProtocolFeature`. The only gate an action
 * of ours can trip is `PostQuantumSignatures` (an ML-DSA-65 key in AddKey, DeleteKey or Stake),
 * live since protocol version 85 while the sandbox runs 86. Deliberately left out: a gate is
 * only ever closed for as long as a network takes to upgrade, and a caller gets nothing
 * actionable out of it, so it falls to `Internal` like the other transient conditions.
 */
describe('signAndSendTransaction › Actions.* conversion errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('fails with Actions.TooMany when the transaction carries too many actions', tooMany(context));

  it(
    'fails with Actions.DeployContract.TooMany when the transaction carries too many deploy actions',
    deployContractTooMany(context),
  );

  it(
    'fails with Actions.FunctionCall.TotalGasLimit.Overflow when the prepaid gas of the actions does not fit u64',
    totalGasLimitOverflow(context),
  );

  it(
    'fails with Actions.FunctionCall.TotalGasLimit.Exceeded when the prepaid gas is over the limit',
    totalGasLimitExceeded(context),
  );
});
