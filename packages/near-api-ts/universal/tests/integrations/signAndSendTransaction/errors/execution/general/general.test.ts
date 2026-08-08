import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { actionForbidden } from './actionForbidden';
import { executorBudgetNotEnough } from './executorBudgetNotEnough';
import { executorNotFound } from './executorNotFound';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

describe('signAndSendTransaction › General execution step errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('fails with Executor.NotFound', executorNotFound(context));
  it('fails with Executor.Budget.NotEnough', executorBudgetNotEnough(context));

  it(
    'fails with Action.Forbidden when try to perform self-only actions on the foreign account',
    actionForbidden(context),
  );
});
