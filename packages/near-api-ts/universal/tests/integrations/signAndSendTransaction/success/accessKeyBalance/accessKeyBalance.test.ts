import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../index';
import type { KeyPair } from '../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';
import { addKeyAndTopUp } from './addKeyAndTopUp';
import { topUpKeyOfAnotherAccount } from './topUpKeyOfAnotherAccount';
import { withdrawToAccount } from './withdrawToAccount';

export type TestContext = {
  client: Client;
  /** The genesis key `nat` and `alice` share. */
  defaultKeyPair: KeyPair;
};

describe('signAndSendTransaction › topUpAccessKeyBalance / withdrawAccessKeyBalance', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it(
    'adds a key paid from its own balance and tops it up in one transaction',
    addKeyAndTopUp(context),
  );
  it('tops up a key of another account', topUpKeyOfAnotherAccount(context));
  it('withdraws from the key balance back to the account', withdrawToAccount(context));
});
