import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { testKeys } from '../../../../../utils/testKeys';
import { executorNotDelegator } from './executorNotDelegator';
import { expired } from './expired';
import { invalidSignature } from './invalidSignature';
import { nonceInvalid } from './nonceInvalid';
import { nonceTooLarge } from './nonceTooLarge';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
  relayKeyPair: KeyPair;
};

describe('signAndSendTransaction › ExecuteDelegation.* errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
    relayKeyPair: keyPair(testKeys.a.privateKey),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('fails with Action.ExecuteDelegation.Signature.Invalid', invalidSignature(context));
  it('fails with Action.ExecuteDelegation.Expired', expired(context));
  it('fails with Action.ExecuteDelegation.Nonce.Invalid', nonceInvalid(context));
  it('fails with Action.ExecuteDelegation.Nonce.TooLarge', nonceTooLarge(context));
  it('fails with Action.ExecuteDelegation.Executor.NotDelegator', executorNotDelegator(context));
});
