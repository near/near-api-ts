import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { contractWasmNotFound } from './contractWasmNotFound';
import { executionError } from './executionFailed/executionError';
import { hostErrorGuestPanic } from './executionFailed/hostErrorGuestPanic';
import { deleteActionMustBeFinal } from './executionFailed/newReceiptValidationError/deleteActionMustBeFinal';
import { functionNotFound } from './functionNotFound';
import { methodInvalidSignature } from './preparationFailed/methodInvalidSignature';
import { preparationFailed } from './preparationFailed/preparationFailed';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

describe('signAndSendTransaction › CallContractFunction.* errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('return Action.CallContractFunction.ContractWasm.NotFound', contractWasmNotFound(context));
  it('return Action.CallContractFunction.Function.NotFound', functionNotFound(context));
  it('return Action.CallContractFunction.Preparation.Failed', preparationFailed(context));
  it(
    'return Action.CallContractFunction.Preparation.Failed: MethodInvalidSignature',
    methodInvalidSignature(context),
  );
  it('return Action.CallContractFunction.Execution.Failed', executionError(context));
  it(
    'return Action.CallContractFunction.Execution.Failed: old HostError.GuestPanic',
    hostErrorGuestPanic(),
  );
  it(
    'return Action.CallContractFunction.Execution.Failed: ' +
      'old NewReceiptValidationError.ActionsValidation.DeleteActionMustBeFinal',
    deleteActionMustBeFinal(context),
  );
});
