import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, it, vi } from 'vitest';
import {
  addFullAccessKey,
  type Client,
  createMemoryKeyService,
  createMemorySigner,
  transfer,
  randomSecp256k1KeyPair,
} from '../../../../../../index';
import { createDefaultClient, log } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';

vi.setConfig({ testTimeout: 60000 });

describe('native transfer by secp256k1 key', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('native transfer', async () => {
    const keyService1 = createMemoryKeyService({
      keySource: { privateKey: DEFAULT_PRIVATE_KEY },
    });

    const signer1 = createMemorySigner({
      signerAccountId: 'nat',
      keyService: keyService1,
      client,
    });

    const secp256k1KeyPair = randomSecp256k1KeyPair();

    await signer1.executeTransaction({
      intent: {
        action: addFullAccessKey(secp256k1KeyPair),
        receiverAccountId: signer1.signerAccountId,
      },
    });

    const keyService2 = createMemoryKeyService({ keySource: secp256k1KeyPair });

    const signer2 = createMemorySigner({
      signerAccountId: 'nat',
      keyService: keyService2,
      client,
    });

    const tx = await signer2.executeTransaction({
      intent: {
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'bob',
      },
    });

    log(tx);
  });
});
