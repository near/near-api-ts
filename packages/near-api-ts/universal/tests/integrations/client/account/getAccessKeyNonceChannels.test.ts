import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  addAccessKey,
  type Client,
  createMemoryKeyService,
  createMemorySigner,
  isNatError,
  type PublicKey,
  randomEd25519KeyPair,
  randomMlDsa65KeyPair,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../utils/common';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import { startFakeRpc } from '../../../utils/startFakeRpc';

describe('Get Access Key Nonce Channels', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  const addKeyWithChannels = async (publicKey: PublicKey, channelCount: number) => {
    const signer = createMemorySigner({
      signerAccountId: 'nat',
      keyService: createMemoryKeyService({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } }),
      client,
    });

    await signer.executeTransaction({
      intent: {
        action: addAccessKey({
          publicKey,
          permission: { kind: 'FullAccess' },
          gasPayment: { source: 'KeyBalance' },
          replayProtection: { channelCount },
        }),
        receiverAccountId: 'nat',
      },
    });
  };

  // Every channel of a new key starts at the same nonce
  it('Ok', async () => {
    const keyPair = randomEd25519KeyPair();
    await addKeyWithChannels(keyPair.publicKey, 3);

    const res = await client.getAccessKeyNonceChannels({
      accountId: 'nat',
      publicKey: keyPair.publicKey,
    });
    const lastNonce = res.nonceChannels[0]?.lastNonce;

    expect(res).toEqual({
      accountId: 'nat',
      publicKeyRef: keyPair.publicKeyRef,
      nonceChannels: [
        { channelId: 0, lastNonce },
        { channelId: 1, lastNonce },
        { channelId: 2, lastNonce },
      ],
      atMomentOf: { blockHash: expect.any(String), blockHeight: expect.any(Number) },
    });
    expect(lastNonce).toBeGreaterThan(0);
  });

  // The account refers to an ml-dsa-65 key by its hash, and so does the output
  it('Ok - ml-dsa-65 key', async () => {
    const keyPair = randomMlDsa65KeyPair();
    await addKeyWithChannels(keyPair.publicKey, 2);

    const { publicKeyRef, nonceChannels } = await client.getAccessKeyNonceChannels({
      accountId: 'nat',
      publicKey: keyPair.publicKey,
    });

    expect(publicKeyRef).toBe(keyPair.publicKeyRef);
    expect(publicKeyRef).toMatch(/^ml-dsa-65-hash:/);
    expect(nonceChannels.map(({ channelId }) => channelId)).toEqual([0, 1]);
  });

  // The sandbox cannot move a channel forward yet, so a fake node reports ones that differ
  it('Ok - channels in order', async () => {
    const keyPair = randomEd25519KeyPair();

    const { fakeClient, close } = await startFakeRpc({
      nonces: [5, 0, 9],
      block_hash: '11111111111111111111111111111111',
      block_height: 1,
    });
    const res = await fakeClient.getAccessKeyNonceChannels({
      accountId: 'nat',
      publicKey: keyPair.publicKey,
    });
    close();

    expect(res).toEqual({
      accountId: 'nat',
      publicKeyRef: keyPair.publicKeyRef,
      nonceChannels: [
        { channelId: 0, lastNonce: 5 },
        { channelId: 1, lastNonce: 0 },
        { channelId: 2, lastNonce: 9 },
      ],
      atMomentOf: { blockHash: '11111111111111111111111111111111', blockHeight: 1 },
    });
  });

  it('Invalid rpc result', async () => {
    const { fakeClient, close } = await startFakeRpc({
      nonces: ['5'],
      block_hash: '11111111111111111111111111111111',
      block_height: 1,
    });
    const res = await fakeClient.safeGetAccessKeyNonceChannels({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });
    close();

    assertNatErrKind(res, 'Client.GetAccessKeyNonceChannels.Exhausted');
    expect(
      isNatError(res.error, 'Client.GetAccessKeyNonceChannels.Exhausted') &&
        res.error.context.lastError.kind === 'SendRequest.Attempt.Response.InvalidSchema',
    ).toBe(true);
  });

  it('Invalid args', async () => {
    const res = await client.safeGetAccessKeyNonceChannels({
      // @ts-expect-error
      accountId2: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });
    assertNatErrKind(res, 'Client.GetAccessKeyNonceChannels.Args.InvalidSchema');
  });

  it('Key with a single nonce channel', async () => {
    const res = await client.safeGetAccessKeyNonceChannels({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
    });
    assertNatErrKind(res, 'Client.GetAccessKeyNonceChannels.Rpc.NonceChannels.NotFound');
    expect(res.error.context).toEqual({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
      atMomentOf: { blockHash: expect.any(String), blockHeight: expect.any(Number) },
    });
  });

  it('Non-existing access key', async () => {
    const res = await client.safeGetAccessKeyNonceChannels({
      accountId: 'nat',
      publicKey: randomEd25519KeyPair().publicKey,
    });
    assertNatErrKind(res, 'Client.GetAccessKeyNonceChannels.Rpc.NonceChannels.NotFound');
  });

  it('Non-existing account', async () => {
    const res = await client.safeGetAccessKeyNonceChannels({
      accountId: 'nat-non-found',
      publicKey: DEFAULT_PUBLIC_KEY,
    });
    assertNatErrKind(res, 'Client.GetAccessKeyNonceChannels.Rpc.NonceChannels.NotFound');
  });

  it('Block not found', async () => {
    const res = await client.safeGetAccessKeyNonceChannels({
      accountId: 'nat',
      publicKey: DEFAULT_PUBLIC_KEY,
      atMomentOf: { blockHeight: 100_000 },
    });
    assertNatErrKind(res, 'Client.GetAccessKeyNonceChannels.Rpc.Block.NotFound');
    expect(res.error.context).toEqual({ blockId: 100_000 });
  });
});
