import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { linkNotFound } from './linkNotFound';
import { pinNotFound } from './pinNotFound';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

describe('signAndSendTransaction › GlobalContract.* errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it(
    'fails with Action.PinGlobalContract.GlobalContract.NotFound when the wasm hash is not registered',
    pinNotFound(context),
  );

  it(
    'fails with Action.LinkGlobalContract.GlobalContract.NotFound when the account has not registered a global contract',
    linkNotFound(context),
  );
});
