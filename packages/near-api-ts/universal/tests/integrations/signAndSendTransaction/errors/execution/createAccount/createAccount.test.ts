import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { alreadyExists } from './alreadyExists';
import { foreignNamespace } from './foreignNamespace';
import { implicitAccount } from './implicitAccount';
import { topLevelNamespace } from './topLevelNamespace';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

describe('signAndSendTransaction › CreateAccount.* errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it(
    'fails with Action.CreateAccount.AlreadyExists when trying to recreate an existing account',
    alreadyExists(context),
  );

  it(
    'fails with Action.CreateAccount.TopLevelNamespace when trying to create a top-level account ' +
      'e.g near, alice etc.',
    topLevelNamespace(context),
  );

  it(
    'fails with Action.CreateAccount.ForeignNamespace when trying to create an account ' +
      'which is not a direct children of the parent account',
    foreignNamespace(context),
  );

  it(
    'fails with Action.CreateAccount.ImplicitAccount when trying to create ' +
      'an implicit native Near account (64 symbols)',
    implicitAccount(context),
  );
});
