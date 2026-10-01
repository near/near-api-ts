import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  type Client,
  createMemoryKeyService,
  type MemoryKeyService,
  transfer,
} from '../../../../index';
import { signTransaction } from '../../../../src/transaction/signTransaction/signTransaction';
import { createDefaultClient } from '../../../utils/common';
import { getLastNonce } from '../../../utils/getLastNonce';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import { testKeys } from '../../../utils/testKeys';

describe('safeSendSignedTransaction › success', () => {
  let client: Client;
  let keyService: MemoryKeyService;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyService = createMemoryKeyService({
      keySources: [
        { privateKey: DEFAULT_PRIVATE_KEY },
        { privateKey: testKeys.fc.forContract.privateKey },
      ],
    });
    return () => sandbox.stop();
  });

  it('sends a native token transfer', async () => {
    const natAccessKey = await client.getAccessKey({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });

    const signedTransaction = await signTransaction({
      signDataProvider: keyService,
      transaction: {
        signerAccountId: 'nat',
        signerPublicKey: DEFAULT_PUBLIC_KEY,
        nonce: getLastNonce(natAccessKey.accessKey) + 1,
        blockHash: natAccessKey.atMomentOf.blockHash,
        action: transfer({ amount: { near: '5' } }),
        receiverAccountId: 'bob',
      },
    });

    await expect(client.sendSignedTransaction({ signedTransaction })).resolves.not.toThrow();
  });
});
