import { DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { type Client } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../utils/common';
import { startSandbox } from '../../../utils/sandbox/startSandbox';

vi.setConfig({ testTimeout: 60000 });

describe('Get Account Access Key', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = await createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('Ok', async () => {
    await expect(
      client.getAccountAccessKey({
        accountId: 'nat',
        publicKey: DEFAULT_PUBLIC_KEY,
      }),
    ).resolves.toMatchObject({
      accountId: 'nat',
      accountAccessKey: {
        accessType: 'FullAccess',
        publicKey: DEFAULT_PUBLIC_KEY,
        nonce: 0,
      },
    });
  });

  it('Invalid args', async () => {
    const res = await client.safeGetAccountAccessKey({
      // @ts-expect-error
      accountId2: 'nat-non-found',
      publicKey: 'ed25519:123',
    });
    assertNatErrKind(res, 'Client.GetAccountAccessKey.Args.InvalidSchema');
  });

  it('Non-existing account', async () => {
    const res = await client.safeGetAccountAccessKey({
      accountId: 'nat-non-found',
      publicKey: 'ed25519:5BGSaf6YjVm7565VzWQHNxoyEjwr3jUpRJSGjREvU9dB',
    });
    assertNatErrKind(
      res,
      'Client.GetAccountAccessKey.Rpc.AccountAccessKey.NotFound',
    );
  });

  it('Non-existing access key', async () => {
    const res = await client.safeGetAccountAccessKey({
      accountId: 'nat',
      publicKey: 'ed25519:5BGSaf6YjVm7565VzWQHNxoyEjwr3jUpRJSGjREvU9d',
    });
    assertNatErrKind(
      res,
      'Client.GetAccountAccessKey.Rpc.AccountAccessKey.NotFound',
    );
  });
});
