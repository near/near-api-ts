import { beforeAll, describe, expect, it } from 'vitest';
import type { Client } from '../../../../../index';
import { assertNatErrKind } from '../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../utils/common';
import { startSandbox } from '../../../../utils/sandbox/startSandbox';

describe('Get Account Info', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('Ok', async () => {
    await expect(client.getAccountInfo({ accountId: 'nat' })).resolves.toMatchObject({
      accountId: 'nat',
      contract: { status: 'NoContract' },
      atMomentOf: { blockHash: expect.any(String), blockHeight: expect.any(Number) },
    });
  });

  it('Invalid args', async () => {
    const res = await client.safeGetAccountInfo({
      accountId: 'nat',
      // @ts-expect-error atMomentOf must be a block reference
      atMomentOf: 123,
    });
    assertNatErrKind(res, 'Client.GetAccountInfo.Args.InvalidSchema');
  });

  it('Non-existing account', async () => {
    const res = await client.safeGetAccountInfo({
      accountId: 'nat-not-found',
      atMomentOf: 'LatestFinalBlock',
    });
    assertNatErrKind(res, 'Client.GetAccountInfo.Rpc.Account.NotFound');
    expect(res.error.context).toEqual({
      accountId: 'nat-not-found',
      blockHash: expect.any(String),
      blockHeight: expect.any(Number),
    });
  });

  it('Block not found', async () => {
    const res = await client.safeGetAccountInfo({
      accountId: 'nat',
      atMomentOf: { blockHeight: 100_000 },
    });
    assertNatErrKind(res, 'Client.GetAccountInfo.Rpc.Block.NotFound');
    expect(res.error.context).toEqual({ blockId: 100_000 });
  });
});
