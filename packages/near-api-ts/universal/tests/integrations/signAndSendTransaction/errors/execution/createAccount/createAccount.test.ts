import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { alreadyExist } from './alreadyExist';
import { foreignNamespace } from './foreignNamespace';
import { implicitDeterministicNearAccount } from './implicitDeterministicNearAccount';
import { implicitEthereumAccount } from './implicitEthereumAccount';
import { implicitNativeNearAccount } from './implicitNativeNearAccount';
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
    'fails with CreateAccount.AlreadyExist when trying to recreate an existing account',
    alreadyExist(context),
  );

  it(
    'fails with CreateAccount.TopLevelNamespace when trying to create a top-level account ' +
      'e.g near, alice etc.',
    topLevelNamespace(context),
  );

  it(
    'fails with CreateAccount.ForeignNamespace when trying to create an account ' +
      'which is not a direct children of the parent account',
    foreignNamespace(context),
  );

  it(
    'fails with CreateAccount.ImplicitAccount when trying to create ' +
      'an implicit native Near account (64 symbols)',
    implicitNativeNearAccount(context),
  );

  it(
    'fails with CreateAccount.ImplicitAccount when trying to create ' +
      'an implicit Ethereum account (0x + 40 symbols)',
    implicitEthereumAccount(context),
  );

  it(
    'fails with CreateAccount.ImplicitAccount when trying to create ' +
      'an deterministic Near account (0s + 40 symbols)',
    implicitDeterministicNearAccount(context),
  );
});
