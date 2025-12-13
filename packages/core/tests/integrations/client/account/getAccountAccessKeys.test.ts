import { vi, expect, it, describe, beforeAll } from 'vitest';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import { type Client, createClient, isNatError } from '../../../../src';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { createDefaultClient } from '../../../utils/common';

vi.setConfig({ testTimeout: 60000 });

describe('Get Account Access Keys', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = await createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('Ok', async () => {
    const res = await client.getAccountAccessKeys({
      accountId: 'nat',
    });
    expect(res.accountAccessKeys[0]).toEqual({
      accessType: 'FullAccess',
      publicKey: DEFAULT_PUBLIC_KEY,
      nonce: 0,
    });
  });

  it('Invalid args', async () => {
    const res = await client.safeGetAccountAccessKeys({
      accountId: 'nat###2%',
    });
    assertNatErrKind(res, 'Client.GetAccountAccessKeys.Args.InvalidSchema');
  });

  it(`Cant' fetch`, async () => {
    const brokenClient = await createClient({
      transport: {
        rpcEndpoints: { regular: [{ url: 'http://localhost:0000' }] },
      },
    });
    const res = await brokenClient.safeGetAccountAccessKeys({
      accountId: 'nat',
    });
    assertNatErrKind(res, 'Client.GetAccountAccessKeys.SendRequest.Failed');

    expect(
      isNatError(res.error, 'Client.GetAccountAccessKeys.SendRequest.Failed') &&
        res.error.context.cause.kind ===
          'Client.Transport.SendRequest.Request.FetchFailed',
    ).toBe(true);
  });

  it('Non-existing account', async () => {
    const res = await client.getAccountAccessKeys({
      accountId: 'nat-non-found',
    });
    expect(res.accountAccessKeys.length).toBe(0);
  });
});
