import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { allowedFunctionsFunctionNameTooLong } from './addKey/allowedFunctionsFunctionNameTooLong';
import { allowedFunctionsTotalSizeExceeded } from './addKey/allowedFunctionsTotalSizeExceeded';
import { invalidAccountId } from './addKey/invalidAccountId';
import { notFinal } from './deleteAccount/notFinal';
import { contractWasmTooLarge } from './deployContract/contractWasmTooLarge';
import { functionArgsTooLarge } from './functionCall/functionArgsTooLarge';
import { functionNameTooLong } from './functionCall/functionNameTooLong';
import { zeroGasLimit } from './functionCall/zeroGasLimit';
import { validatorKeyInvalid } from './stake/validatorKeyInvalid';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

/**
 * The `ActionValidationErrorRegistry` half of `InvalidTxError::ActionsValidation`: the kinds that
 * blame one action rather than the list it sits in. The node raises them inside the loop of
 * `validate_actions_with_mode` (`runtime/runtime/src/action_validation.rs`), through the
 * `validate_*_action` helper of the action at hand; the counts and the total gas that bracket
 * that loop belongs to the sibling `actions` group.
 *
 * The cases follow the order the node checks them in, because an earlier check hides a later
 * one — both across the loop and within a single helper, where `validate_function_call_action`
 * looks at the gas, then the name, then the arguments. The skipped ones are parked at the end.
 *
 * The variants of this half that can't be reached through this library at all:
 *
 * - `DelegateActionMustBeOnlyOne`,
 * - `InvalidDeterministicStateInitReceiver`,
 * - `DeterministicStateInitKeyLengthExceeded`,
 * - `DeterministicStateInitValueLengthExceeded`,
 * - `GasKeyInvalidNumNonces`,
 * - `AddGasKeyWithNonZeroBalance`,
 * - `GasKeyFunctionCallAllowanceNotAllowed`
 *
 * — need Delegate, DeterministicStateInit or gas key
 *   actions, none of which the library builds yet.
 */
describe('signAndSendTransaction › Action.* conversion errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it(
    'fails with Action.DeleteAccount.NotFinal when an action follows the account deletion',
    notFinal(context),
  );

  it(
    'fails with Action.FunctionCall.ZeroGasLimit when the function call attaches no gas',
    zeroGasLimit(context),
  );

  it(
    'fails with Action.FunctionCall.FunctionName.TooLong when the function name is over the limit',
    functionNameTooLong(context),
  );

  it(
    'fails with Action.Stake.ValidatorKey.Invalid when the validator key is not a stakeable one',
    validatorKeyInvalid(context),
  );

  it(
    'fails with Action.AddKey.AllowedFunctions.FunctionName.TooLong when one allowed function name is over the limit',
    allowedFunctionsFunctionNameTooLong(context),
  );

  it(
    'fails with Action.AddKey.AllowedFunctions.TotalSize.Exceeded when the allowed functions are too long together',
    allowedFunctionsTotalSizeExceeded(context),
  );

  // Skipped: the 4 MiB wasm needed to fail the check doesn't fit into the request body the node
  // accepts, so it can't be delivered at all — see `contractWasmTooLarge`.
  it.skip(
    'fails with Action.DeployContract.ContractWasm.TooLarge when the contract wasm is over the limit',
    contractWasmTooLarge(context),
  );

  // Skipped: 4 MiB of arguments run into the same request body ceiling — see
  // `functionArgsTooLarge`.
  it.skip(
    'fails with Action.FunctionCall.FunctionArgs.TooLarge when the function arguments are over the limit',
    functionArgsTooLarge(context),
  );

  // Skipped: the node does answer with it, but only for a transaction assembled behind the
  // library's back — nothing built with the action creators can reach it, see `invalidAccountId`.
  it.skip(
    'fails with InvalidAccountId when the added key is bound to a malformed contract account id',
    invalidAccountId(context),
  );
});
