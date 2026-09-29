import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  addAccessKey,
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
      client.getAccessKey({
        accountId: 'nat',
        publicKey: DEFAULT_PUBLIC_KEY,
      }),
    ).resolves.toMatchObject({
      accountId: 'nat',
      accessKey: {
        publicKeyRef: DEFAULT_PUBLIC_KEY,
        permission: { kind: 'FullAccess' },
        gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
        replayProtection: { scheme: 'SingleNonceSequence', lastNonce: 0 },
      },
      atMomentOf: { blockHash: expect.any(String), blockHeight: expect.any(Number) },
    });
  });

  // The node does not return the key, and the output refers to it the same way
  // client.getAccessKeys does — by the hash for an ml-dsa-65 key
  it('Ok - ml-dsa-65 key', async () => {
    const mlDsa65KeyPair = randomMlDsa65KeyPair();

    const signer = createMemorySigner({
      signerAccountId: 'nat',
      keyService: createMemoryKeyService({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } }),
      client,
    });

    await signer.executeTransaction({
      intent: {
        action: addAccessKey({
          publicKey: mlDsa65KeyPair.publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'AccountBalance' },
        }),
        receiverAccountId: 'nat',
      },
    });

    const { accessKey } = await client.getAccessKey({
      accountId: 'nat',
      publicKey: mlDsa65KeyPair.publicKey,
    });

    expect(accessKey).toEqual({
      publicKeyRef: mlDsa65KeyPair.publicKeyRef,
      permission: { kind: 'FullAccess' },
      gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
      replayProtection: { scheme: 'SingleNonceSequence', lastNonce: expect.any(Number) },
    });
    expect(accessKey.publicKeyRef).toMatch(/^ml-dsa-65-hash:/);
  });

  it('Invalid args', async () => {
    const res = await client.safeGetAccessKey({
      // @ts-expect-error
      accountId2: 'nat-non-found',
      publicKey: 'ed25519:123',
    });
    assertNatErrKind(res, 'Client.GetAccessKey.Args.InvalidSchema');
  });

  it('Non-existing account', async () => {
    const res = await client.safeGetAccessKey({
      accountId: 'nat-non-found',
      publicKey: 'ed25519:5BGSaf6YjVm7565VzWQHNxoyEjwr3jUpRJSGjREvU9dB',
    });
    assertNatErrKind(res, 'Client.GetAccessKey.Rpc.AccessKey.NotFound');
  });

  it('Non-existing access key', async () => {
    const res = await client.safeGetAccessKey({
      accountId: 'nat',
      publicKey: 'ed25519:5BGSaf6YjVm7565VzWQHNxoyEjwr3jUpRJSGjREvU9d',
    });
    assertNatErrKind(res, 'Client.GetAccessKey.Rpc.AccessKey.NotFound');
  });
});
