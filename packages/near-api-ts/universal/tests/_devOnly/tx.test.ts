import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, it, vi } from 'vitest';
import {
  addFullAccessKey,
  type Client,
  createAccount,
  createClient,
  createMemoryKeyService,
  createMemorySigner,
  deployContract,
  functionCall,
  transfer,
} from '../../index';
import { SignedTransactionSchema } from '../../src/_common/schemas/zod/transaction/transaction';
import { toBorshSignedTransaction } from '../../src/_common/transformers/toBorshBytes/transaction';
import { safeSleep } from '../../src/_common/utils/sleep';
import { createDefaultClient, getFileBytes, log } from '../utils/common';
import { startSandbox } from '../utils/sandbox/startSandbox';

vi.setConfig({ testTimeout: 60 * 60 * 1000 });

describe('Get Detailed Transaction', () => {
  // let client: Client;

  beforeAll(async () => {
    // const sandbox = await startSandbox();
    // client = createDefaultClient(sandbox);
    // return () => sandbox.stop();
  });

  it('Test', async () => {
    // const keyService = createMemoryKeyService({
    //   keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }],
    // });
    const node0Url = 'http://localhost:5000';
    const node1Url = 'http://localhost:5001';

    const client = createClient({
      transport: {
        rpcEndpoints: { archival: [{ url: node1Url }] },
      },
    });

    const res = await client.safeGetAccountInfo({
      accountId: 'near',
    })

    log(res);
  });
});
