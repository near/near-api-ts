import { vi, expect, it, describe, beforeAll } from 'vitest';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import { type Client } from '../../../../src';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../utils/common';

vi.setConfig({ testTimeout: 60000 });

describe('Get Block', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = await createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('Ok default value', async () => {
    const res = client.getBlock();
    await expect(res).resolves.not.toThrow();
  });

  it('Ok block height', async () => {
    const res = await client.safeGetBlock({
      blockReference: { blockHeight: 0 },
    });
    expect(res.ok).toBe(true);
  });

  it('Block not found', async () => {
    const res = await client.safeGetBlock({
      blockReference: { blockHeight: 1000 },
    });
    assertNatErrKind(res, 'Client.GetBlock.Rpc.Block.NotFound');
  });
});
