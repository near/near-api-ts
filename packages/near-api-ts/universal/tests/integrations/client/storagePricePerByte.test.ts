import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { assertNatErrKind } from '../../utils/assertNatErrKind';
import { createDefaultClient } from '../../utils/common';
import { startSandbox } from '../../utils/sandbox/startSandbox';

describe('client › storage price per byte', () => {
  let sandbox: Awaited<ReturnType<typeof startSandbox>>;

  const countProtocolConfigRequests = (fetchCalls: Parameters<typeof fetch>[]) =>
    fetchCalls.filter(
      ([, init]) => JSON.parse(String(init?.body)).method === 'EXPERIMENTAL_protocol_config',
    ).length;

  beforeAll(async () => {
    sandbox = await startSandbox();
    return () => sandbox.stop();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('makes one request for the calls that come while the price is being fetched', async () => {
    const client = createDefaultClient(sandbox);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const accountInfos = await Promise.all(
      Array.from({ length: 10 }, () => client.getAccountInfo({ accountId: 'nat' })),
    );

    expect(countProtocolConfigRequests(fetchSpy.mock.calls)).toBe(1);
    expect(accountInfos).toHaveLength(10);
  });

  it('fetches a call with its own signal alone, so aborting it leaves the others be', async () => {
    const client = createDefaultClient(sandbox);
    const controller = new AbortController();

    const aborted = client.safeGetAccountInfo({
      accountId: 'nat',
      options: { signal: controller.signal },
    });
    const shared = client.safeGetAccountInfo({ accountId: 'nat' });
    controller.abort();

    assertNatErrKind(await aborted, 'Client.GetAccountInfo.Aborted');
    expect((await shared).success).toBe(true);
  });
});
