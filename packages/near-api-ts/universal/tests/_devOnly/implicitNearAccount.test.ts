import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it } from 'vitest';
import {
  createMemoryKeyService,
  createMemorySignerFactory,
  keyPair,
  near,
  transfer,
} from '../../index';
import { safeSleep } from '../../src/_common/utils/sleep';
import { createAccount } from '../../src/helpers/actionCreators/createAccount';
import type { Client } from '../../types/client/client';
import type { MemorySignerFactory } from '../../types/signers/memorySigner/public/createMemorySigner';
import { createDefaultClient, log } from '../utils/common';
import { startSandbox } from '../utils/sandbox/startSandbox';

const implicitKp = keyPair(
  'ed25519:ZqHQVnePD2LB9NnbRzGvsP7iBBfeLddPRZCVTXWsLhcM2KXiRWi7vWJUwE6Mn8ULNf4zLfoBmH3TpTUV4oPAi6X',
);
const implicitAccountId = '8a3a2af86f8b2a0d013761565dc6ee86af153f6fa4c7db4bd9a52f63ff072d4c';

describe('CallContractReadFunction', () => {
  let client: Client;
  let createSigner: MemorySignerFactory;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    const keyService = createMemoryKeyService({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }, implicitKp],
    });
    createSigner = createMemorySignerFactory({ client, keyService });
    return () => sandbox.stop();
  });
  //  addFullAccessKey(implicitKp)
  it('Ok', async () => {
    const nat = createSigner('nat');

    const tx = await nat.safeExecuteTransaction({
      intent: {
        actions: [transfer({ amount: near('50') })],
        receiverAccountId: implicitAccountId,
      },
    });
    // log(tx);

    await safeSleep(1000);
    const implicit = createSigner(implicitAccountId);

    const tx2 = await implicit.safeExecuteTransaction({
      intent: {
        actions: [createAccount(), transfer({ amount: near('1') })],
        receiverAccountId: '123.near',
      },
    });
    log(tx2);
  });
});
