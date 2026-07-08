import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { compilationFailed } from './compilationFailed/compilationFailed';
import { methodInvalidSignature } from './compilationFailed/methodInvalidSignature';
import { executionError } from './executionFailed/executionError';
import { hostErrorGuestPanic } from './executionFailed/hostErrorGuestPanic';
import { deleteActionMustBeFinal } from './executionFailed/newReceiptValidationError/deleteActionMustBeFinal';
import { functionNotFound } from './functionNotFound';
import { wasmNotFound } from './wasmNotFound';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

describe('signAndSendTransaction › FunctionCall.* errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('return Action.FunctionCall.Wasm.NotFound', wasmNotFound(context));
  it('return Action.FunctionCall.Function.NotFound', functionNotFound(context));
  it('return Action.FunctionCall.Compilation.Failed', compilationFailed(context));
  it(
    'return Action.FunctionCall.Compilation.Failed: MethodInvalidSignature',
    methodInvalidSignature(context),
  );
  it('return Action.FunctionCall.Execution.Failed', executionError(context));
  it(
    'return Action.FunctionCall.Execution.Failed: old HostError.GuestPanic',
    hostErrorGuestPanic(),
  );
  it(
    'return Action.FunctionCall.Execution.Failed: ' +
      'old NewReceiptValidationError.ActionsValidation.DeleteActionMustBeFinal',
    deleteActionMustBeFinal(context),
  );
});
