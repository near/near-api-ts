import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { belowThreshold } from './belowThreshold';
import { notEnoughBalance } from './notEnoughBalance';
import { notFound } from './notFound';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

describe('signAndSendTransaction › Stake.* errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it(
    'fails with Action.Stake.NotEnoughBalance when staking more than the account balance',
    notEnoughBalance(context),
  );

  it(
    'fails with Action.Stake.BelowThreshold when the stake is below the seat price',
    belowThreshold(context),
  );

  it(
    'fails with Action.Stake.NotFound when staking zero with an unknown validator key',
    notFound(context),
  );
});
