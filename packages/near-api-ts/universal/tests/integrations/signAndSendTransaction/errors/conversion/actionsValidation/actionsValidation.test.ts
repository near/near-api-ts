import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { addKeyMethodNamesNumberOfBytesExceeded } from './addKeyMethodNamesNumberOfBytesExceeded';
import { deleteActionMustBeFinal } from './deleteActionMustBeFinal';
import { functionCallZeroAttachedGas } from './functionCallZeroAttachedGas';
import { integerOverflow } from './integerOverflow';
import { totalNumberOfActionsExceeded } from './totalNumberOfActionsExceeded';
import { totalNumberOfDeployActionsExceeded } from './totalNumberOfDeployActionsExceeded';
import { totalPrepaidGasExceeded } from './totalPrepaidGasExceeded';
import { unsuitableStakingKey } from './unsuitableStakingKey';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

/**
 * `InvalidTxError::ActionsValidation` wraps `ActionsValidationError`, produced by
 * `validate_actions_with_mode` (`runtime/runtime/src/action_validation.rs`). The cases below
 * follow the order the node checks them in, because an earlier check hides a later one.
 *
 * The remaining variants of the enum can't be reached through this library:
 *
 * - `InvalidAccountId`, `AddKeyMethodNameLengthExceeded`,
 *   `FunctionCallMethodNameLengthExceeded`, `FunctionCallEmptyMethodName` — the node accepts
 *   account ids and method names the borsh layer never validated, while our action creators
 *   reject them first: `AccountIdZodSchema` mirrors `AccountId::is_valid`, and
 *   `ContractFunctionNameZodSchema` allows 1..=256 characters, exactly the node's
 *   `max_length_method_name`.
 * - `ContractSizeExceeded` (4 MiB) and `FunctionCallArgumentsLengthExceeded` (4 MiB) — both
 *   limits are above what the node's 2 MiB request-body ceiling lets through, the same wall
 *   `general/transactionSizeExceeded` documents.
 * - `DelegateActionMustBeOnlyOne`, `InvalidDeterministicStateInitReceiver`,
 *   `DeterministicStateInitKeyLengthExceeded`, `DeterministicStateInitValueLengthExceeded`,
 *   `GasKeyInvalidNumNonces`, `AddGasKeyWithNonZeroBalance`,
 *   `GasKeyFunctionCallAllowanceNotAllowed` — need Delegate, DeterministicStateInit or gas key
 *   actions, none of which the library builds yet.
 * - `UnsupportedProtocolFeature` — raised for actions gated behind a protocol feature the node
 *   hasn't switched on; every action the library builds is live on the sandbox protocol version.
 */
describe('signAndSendTransaction › ActionsValidation.* conversion errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it(
    'fails with TotalNumberOfActionsExceeded when the transaction carries too many actions',
    totalNumberOfActionsExceeded(context),
  );

  it(
    'fails with TotalNumberOfDeployActionsExceeded when the transaction carries too many deploy actions',
    totalNumberOfDeployActionsExceeded(context),
  );

  it(
    'fails with DeleteActionMustBeFinal when an action follows the account deletion',
    deleteActionMustBeFinal(context),
  );

  it(
    'fails with FunctionCallZeroAttachedGas when the function call attaches no gas',
    functionCallZeroAttachedGas(context),
  );

  it(
    'fails with UnsuitableStakingKey when the validator key is not an ed25519 one',
    unsuitableStakingKey(context),
  );

  it(
    'fails with AddKeyMethodNamesNumberOfBytesExceeded when the allowed functions are too long',
    addKeyMethodNamesNumberOfBytesExceeded(context),
  );

  it(
    'fails with IntegerOverflow when the prepaid gas of the actions does not fit u64',
    integerOverflow(context),
  );

  it(
    'fails with TotalPrepaidGasExceeded when the prepaid gas is over the limit',
    totalPrepaidGasExceeded(context),
  );
});
