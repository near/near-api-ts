import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { assertNatErrKind } from '../../utils/assertNatErrKind';
import { createDefaultClient } from '../../utils/common';
import { startSandbox } from '../../utils/sandbox/startSandbox';

describe('client › recent block hash', () => {
  let sandbox: Awaited<ReturnType<typeof startSandbox>>;

  const countBlockRequests = (fetchCalls: Parameters<typeof fetch>[]) =>
    fetchCalls.filter(([, init]) => JSON.parse(String(init?.body)).method === 'block').length;

  beforeAll(async () => {
    sandbox = await startSandbox();
    return () => sandbox.stop();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
