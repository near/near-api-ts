import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { testKeys } from '../../../../../utils/testKeys';
import { balanceNotEnough } from './balanceNotEnough';
import { balanceNotFound } from './balanceNotFound';
import { delegatedBalanceNotFound } from './delegatedBalanceNotFound';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
  relayKeyPair: KeyPair;
};

describe('signAndSendTransaction › WithdrawAccessKeyBalance.* errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
    relayKeyPair: keyPair(testKeys.a.privateKey),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it(
    'fails with Action.WithdrawAccessKeyBalance.Balance.NotFound when the key does not exist',
    balanceNotFound(context),
  );
  it(
    'fails with Action.WithdrawAccessKeyBalance.Balance.NotEnough when the amount exceeds the key balance',
    balanceNotEnough(context),
  );
  it(
    'reports Action.WithdrawAccessKeyBalance.Balance.NotFound on the step of a delegated withdrawal',
    delegatedBalanceNotFound(context),
  );
});
