import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import * as z from 'zod/mini';
import {
  type Client,
  createMemoryVault,
  createSigner,
  createVaultSignService,
  transfer,
} from '../../../../index';
import { createDefaultClient } from '../../../utils/common';
import { startSandbox } from '../../../utils/sandbox/startSandbox';

const countRequests = (fetchCalls: Parameters<typeof fetch>[], method: string) =>
  fetchCalls.filter(([, init]) => JSON.parse(String(init?.body)).method === method).length;

const waitForFinalBlockHeight = async (client: Client, blockHeight: number) => {
  while (
    (await client.getBlock({ blockReference: 'LatestFinalBlock' })).rawRpcResult.header.height <
    blockHeight
  )
    await new Promise((resolve) => setTimeout(resolve, 500));
};

z.config(z.locales.en());
describe('Signer.executeTransaction', async () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('Expired block hash handled', async () => {
    const nat = createSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({
        vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
      }),
    });

    const intent = {
      action: transfer({ amount: { yoctoNear: '1' } }),
      receiverAccountId: 'nat',
    };

    // The first transaction leaves a block hash in the client's cache, which keeps it for an hour
    expect((await nat.safeExecuteTransaction({ intent })).success).toBe(true);

    // The sandbox keeps a transaction valid for 100 blocks - wait until the cached hash is older
    const cachedBlockHash = await client.getRecentBlockHash();
    const cachedBlock = await client.getBlock({ blockReference: { blockHash: cachedBlockHash } });
    await waitForFinalBlockHeight(client, cachedBlock.rawRpcResult.header.height + 110);

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const tx = await nat.safeExecuteTransaction({ intent });

    // The first send is refused as expired, the second one carries a fresh block hash
    expect(tx.success).toBe(true);
    expect(countRequests(fetchSpy.mock.calls, 'send_tx')).toBe(2);
    fetchSpy.mockRestore();
  }, 60_000);
});
