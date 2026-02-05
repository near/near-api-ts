import { beforeAll, describe, it, vi } from 'vitest';
import {
  createMemoryKeyService,
  type Client,
  transfer,
  randomEd25519KeyPair,
  addFullAccessKey,
  createMemorySigner,
} from '../../../../../../src';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';
import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';

vi.setConfig({ testTimeout: 60000 });

describe('100 native transfers', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('100 native transfers by 10 FA keys', async () => {
    const keyPairs = new Array(9).fill(0).map(() => randomEd25519KeyPair());

    const keyService = createMemoryKeyService({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }, ...keyPairs],
    });

    const baseSigner = createMemorySigner({
      signerAccountId: 'nat',
      keyService,
      client,
    });

    await baseSigner.executeTransaction({
      intent: {
        actions: keyPairs.map((keyPair) => addFullAccessKey(keyPair)),
        receiverAccountId: baseSigner.signerAccountId,
      },
    });

    const signer = createMemorySigner({
      signerAccountId: 'nat',
      keyService,
      client,
    });

    // 4. Send 100 transfer transactions in parallel
    const sendNearTokensResults = await Promise.all(
      new Array(100).fill(0).map((_, index) =>
        signer.executeTransaction({
          intent: {
            action: transfer({
              amount: { yoctoNear: BigInt(index.toString() + 1) },
            }),
            receiverAccountId: 'bob',
          },
        }),
      ),
    );

    // log(sendNearTokensResults);

    sendNearTokensResults.forEach((result) =>
      console.log(
        result.rawRpcResult.transaction.hash,
        result.rawRpcResult.status,
      ),
    );
  });
});
