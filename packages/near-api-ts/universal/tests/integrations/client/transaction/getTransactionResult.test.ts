import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  type Client,
  createClient,
  createMemoryKeyService,
  createMemorySigner,
  type MemoryKeyService,
  transfer,
} from '../../../../index';
import { safeSleep } from '../../../../src/_common/utils/sleep';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { createDefaultClient, log } from '../../../utils/common';
import { startShardedSandbox } from '../../../utils/sandbox/sharded/startShardedSandbox';
import { startSandbox } from '../../../utils/sandbox/startSandbox';

vi.setConfig({ testTimeout: 60000 });

describe('getTransactionResult', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('simple tx', async () => {
    const keyService = createMemoryKeyService({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } });

    const alice = createMemorySigner({
      signerAccountId: 'alice',
      client,
      keyService,
    });

    const signedTransaction = await alice.signTransaction({
      intent: {
        action: transfer({ amount: { near: '1' } }),
        receiverAccountId: 'nat',
      },
    });

    client.sendSignedTransaction({ signedTransaction, })
    console.log('2');

    await safeSleep(200)

    const txResult = await client.safeGetTransactionResult({
      // transactionHash: tx.rawRpcResult.transaction.hash,
      transactionHash: signedTransaction.transactionHash
      // transactionHash: '9Hzcxs5jcw3xNfdZB3ostNuyjzfkD9UQikHuuLoxtuSH',
    });

    log(txResult);
  });
});
