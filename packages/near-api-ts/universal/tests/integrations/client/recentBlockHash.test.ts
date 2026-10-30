import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { type Client, createClient, safeCreateClient } from '../../../index';
import type { Milliseconds } from '../../../types/_common/common';
import { assertNatErrKind } from '../../utils/assertNatErrKind';
import { createDefaultClient } from '../../utils/common';
import { startSandbox } from '../../utils/sandbox/startSandbox';

describe('client › recent block hash', () => {
  let sandbox: Awaited<ReturnType<typeof startSandbox>>;

  const countBlockRequests = (fetchCalls: Parameters<typeof fetch>[]) =>
    fetchCalls.filter(([, init]) => JSON.parse(String(init?.body)).method === 'block').length;

  // Moves the clock the cache reads instead of waiting the ttl out: the block hash is still
  // used a moment before the ttl passes, and fetched anew once it has
  const assertKeptFor = async (client: Client, ttlMs: Milliseconds) => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const fetchedAt = Date.now();
    const dateNow = vi.spyOn(Date, 'now').mockReturnValue(fetchedAt);
    await client.getRecentBlockHash();

    dateNow.mockReturnValue(fetchedAt + ttlMs - 1);
    await client.getRecentBlockHash();
    expect(countBlockRequests(fetchSpy.mock.calls)).toBe(1);

    dateNow.mockReturnValue(fetchedAt + ttlMs);
    await client.getRecentBlockHash();
    expect(countBlockRequests(fetchSpy.mock.calls)).toBe(2);
  };

  beforeAll(async () => {
    sandbox = await startSandbox();
    return () => sandbox.stop();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps a block hash for an hour by default', async () => {
    await assertKeptFor(createDefaultClient(sandbox), 3_600_000);
  });

  it('keeps a block hash for the ttl the client is created with', async () => {
    const client = createClient({
      transport: { rpcEndpoints: { archival: [{ url: sandbox.rpcUrl }] } },
      cache: { recentBlockHash: { ttlMs: 5_000 } },
    });

    await assertKeptFor(client, 5_000);
  });

  it('fails with CreateClient.Args.InvalidSchema for a negative ttl', () => {
    const client = safeCreateClient({
      transport: { rpcEndpoints: { archival: [{ url: sandbox.rpcUrl }] } },
      cache: { recentBlockHash: { ttlMs: -1 } },
    });

    assertNatErrKind(client, 'CreateClient.Args.InvalidSchema');
  });

  it('makes one request for the calls that come while the block is being fetched', async () => {
    const client = createDefaultClient(sandbox);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const blockHashes = await Promise.all(
      Array.from({ length: 10 }, () => client.getRecentBlockHash()),
    );

    expect(countBlockRequests(fetchSpy.mock.calls)).toBe(1);
    expect(new Set(blockHashes).size).toBe(1);
  });

  it('fetches a call with its own signal alone, so aborting it leaves the others be', async () => {
    const client = createDefaultClient(sandbox);
    const controller = new AbortController();

    const aborted = client.safeGetRecentBlockHash({ options: { signal: controller.signal } });
    const shared = client.safeGetRecentBlockHash();
    controller.abort();

    assertNatErrKind(await aborted, 'Client.GetRecentBlockHash.Aborted');
    expect((await shared).success).toBe(true);
  });
});
