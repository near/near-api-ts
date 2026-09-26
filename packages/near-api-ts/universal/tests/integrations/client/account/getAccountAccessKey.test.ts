import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  addFullAccessKey,
  type Client,
  createMemoryKeyService,
  createMemorySigner,
  randomMlDsa65KeyPair,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../utils/common';
import { startSandbox } from '../../../utils/sandbox/startSandbox';

describe('Get Account Access Key', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
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
        publicKeyRef: DEFAULT_PUBLIC_KEY,
        permission: { kind: 'FullAccess' },
        gasPayment: { source: 'AccountBalance', spendingLimit: 'Unlimited' },
        replayProtection: { scheme: 'SingleNonceSequence', lastNonce: 0 },
      },
    });
  });

  // The node does not return the key, and the output refers to it the same way
  // client.getAccountAccessKeys does — by the hash for an ml-dsa-65 key
  it('Ok - ml-dsa-65 key', async () => {
    const mlDsa65KeyPair = randomMlDsa65KeyPair();

    const signer = createMemorySigner({
      signerAccountId: 'nat',
      keyService: createMemoryKeyService({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } }),
      client,
    });

    await signer.executeTransaction({
      intent: {
        action: addFullAccessKey(mlDsa65KeyPair),
        receiverAccountId: 'nat',
      },
    });

    const { accountAccessKey } = await client.getAccountAccessKey({
      accountId: 'nat',
      publicKey: mlDsa65KeyPair.publicKey,
    });

    expect(accountAccessKey).toEqual({
      publicKeyRef: mlDsa65KeyPair.publicKeyRef,
      permission: { kind: 'FullAccess' },
      gasPayment: { source: 'AccountBalance', spendingLimit: 'Unlimited' },
      replayProtection: { scheme: 'SingleNonceSequence', lastNonce: expect.any(Number) },
    });
    expect(accountAccessKey.publicKeyRef).toMatch(/^ml-dsa-65-hash:/);
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
    assertNatErrKind(res, 'Client.GetAccountAccessKey.Rpc.AccountAccessKey.NotFound');
  });

  it('Non-existing access key', async () => {
    const res = await client.safeGetAccountAccessKey({
      accountId: 'nat',
      publicKey: 'ed25519:5BGSaf6YjVm7565VzWQHNxoyEjwr3jUpRJSGjREvU9d',
    });
    assertNatErrKind(res, 'Client.GetAccountAccessKey.Rpc.AccountAccessKey.NotFound');
  });
});
