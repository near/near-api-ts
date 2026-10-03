import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../index';
import type { KeyPair } from '../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';
import { consecutiveNonce } from './consecutiveNonce';
import { increasingNonce } from './increasingNonce';
import { nonceChannels } from './nonceChannels';

export type TestContext = {
  client: Client;
  /** The genesis key `nat`, `alice` and `bob` all share. */
  defaultKeyPair: KeyPair;
};

describe('signAndSendTransaction › replay protection › success', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('takes the next nonce of the channel by default', consecutiveNonce(context));
  it('skips ahead with an increasing nonce', increasingNonce(context));
  it('signs in parallel on the nonce channels of a key', nonceChannels(context));
});
