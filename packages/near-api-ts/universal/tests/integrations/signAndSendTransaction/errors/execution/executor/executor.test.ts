import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { notEnoughBalance } from './notEnoughBalance';
import { notFound } from './notFound';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

describe('signAndSendTransaction › Executor.* errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it(
    'fails with Executor.NotFound when try to transfer NEAR to non-existing account',
    notFound(context),
  );

  it(
    'fails with Executor.NotEnoughBalance ' +
      'when try to create a new named subaccount and deploy a contract, ' +
      'but subaccount has not enough storage deposit',
    notEnoughBalance(context),
  );
});
