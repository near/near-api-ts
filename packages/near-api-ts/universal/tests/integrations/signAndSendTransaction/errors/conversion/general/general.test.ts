import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import { type Client, keyPair } from '../../../../../../index';
import type { KeyPair } from '../../../../../../types/_common/keyPairs/keyPair';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { costOverflow } from './costOverflow';
import { transactionSizeExceeded } from './transactionSizeExceeded';

export type TestContext = {
  client: Client;
  defaultKeyPair: KeyPair;
};

describe('signAndSendTransaction › General conversion errors', () => {
  const context = {
    defaultKeyPair: keyPair(DEFAULT_PRIVATE_KEY),
  } as TestContext;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    context.client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  // Skipped: a transaction big enough to fail the check no longer fits into the request
  // body the node accepts, so it can't be delivered at all — see `transactionSizeExceeded`.
  it.skip(
    'fails with TransactionSizeExceeded when the transaction is over the size limit',
    transactionSizeExceeded(context),
  );

  it('fails with CostOverflow when the transaction cost does not fit u128', costOverflow(context));
});
