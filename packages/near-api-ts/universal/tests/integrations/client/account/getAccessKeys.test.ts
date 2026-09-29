import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  addFullAccessKey,
  type Client,
  createClient,
  createMemoryKeyService,
  createMemorySigner,
  isNatError,
  randomEd25519KeyPair,
  randomMlDsa65KeyPair,
  randomSecp256k1KeyPair,
  yoctoNear,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../utils/common';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import { startFakeRpc } from '../../../utils/startFakeRpc';

describe('Get Account Access Keys', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('Ok', async () => {
    const res = await client.getAccessKeys({
      accountId: 'nat',
    });
    expect(res.accessKeys[0]).toEqual({
      publicKeyRef: DEFAULT_PUBLIC_KEY,
      permission: { kind: 'FullAccess' },
      gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
      replayProtection: { scheme: 'SingleNonceSequence', lastNonce: 0 },
    });
  });

  // The node lists an ml-dsa-65 key by the hash of the key, and any other key by the key itself
  it('Ok - key refs', async () => {
    const mlDsa65KeyPair = randomMlDsa65KeyPair();
    const secp256k1KeyPair = randomSecp256k1KeyPair();

    const signer = createMemorySigner({
      signerAccountId: 'nat',
      keyService: createMemoryKeyService({ keySource: { privateKey: DEFAULT_PRIVATE_KEY } }),
      client,
    });

    await signer.executeTransaction({
      intent: {
        actions: [addFullAccessKey(mlDsa65KeyPair), addFullAccessKey(secp256k1KeyPair)],
        receiverAccountId: 'nat',
      },
    });

    const { accessKeys } = await client.getAccessKeys({ accountId: 'nat' });

    expect(accessKeys.map(({ publicKeyRef }) => publicKeyRef).sort()).toEqual(
      [DEFAULT_PUBLIC_KEY, secp256k1KeyPair.publicKey, mlDsa65KeyPair.publicKeyRef].sort(),
    );
    expect(mlDsa65KeyPair.publicKeyRef).toMatch(/^ml-dsa-65-hash:/);
  });

  // The sandbox cannot add a gas key yet, so a fake node lists one key of every kind
  it('Ok - every kind of key', async () => {
    const [fullAccess, functionCall, limitedFunctionCall, gasKeyFullAccess, gasKeyFunctionCall] =
      Array.from({ length: 5 }, () => randomEd25519KeyPair().publicKey);

    const { fakeClient, close } = await startFakeRpc({
      keys: [
        {
          public_key: fullAccess,
          access_key: { nonce: 5, permission: 'FullAccess' },
        },
        {
          public_key: functionCall,
          access_key: {
            nonce: 6,
            permission: {
              FunctionCall: {
                allowance: null,
                receiver_id: 'contract.near',
                method_names: [],
              },
            },
          },
        },
        {
          public_key: limitedFunctionCall,
          access_key: {
            nonce: 7,
            permission: {
              FunctionCall: {
                allowance: '250000000000000000000000',
                receiver_id: 'contract.near',
                method_names: ['add_record'],
              },
            },
          },
        },
        {
          public_key: gasKeyFullAccess,
          access_key: {
            nonce: 0,
            permission: { GasKeyFullAccess: { balance: '1000', num_nonces: 4 } },
          },
        },
        {
          public_key: gasKeyFunctionCall,
          access_key: {
            nonce: 0,
            permission: {
              GasKeyFunctionCall: {
                balance: '2000',
                num_nonces: 1024,
                allowance: null,
                receiver_id: 'contract.near',
                method_names: [],
              },
            },
          },
        },
      ],
      block_hash: '11111111111111111111111111111111',
      block_height: 1,
    });
    const { accessKeys } = await fakeClient.getAccessKeys({ accountId: 'nat' });
    close();

    expect(accessKeys).toEqual([
      {
        publicKeyRef: fullAccess,
        permission: { kind: 'FullAccess' },
        gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
        replayProtection: { scheme: 'SingleNonceSequence', lastNonce: 5 },
      },
      {
        publicKeyRef: functionCall,
        permission: {
          kind: 'FunctionCall',
          allowedContract: 'contract.near',
          allowedFunctions: 'AllNonPayable',
        },
        gasPayment: { source: 'AccountBalance', allowance: 'Unlimited' },
        replayProtection: { scheme: 'SingleNonceSequence', lastNonce: 6 },
      },
      {
        publicKeyRef: limitedFunctionCall,
        permission: {
          kind: 'FunctionCall',
          allowedContract: 'contract.near',
          allowedFunctions: ['add_record'],
        },
        gasPayment: {
          source: 'AccountBalance',
          allowance: yoctoNear('250000000000000000000000'),
        },
        replayProtection: { scheme: 'SingleNonceSequence', lastNonce: 7 },
      },
      {
        publicKeyRef: gasKeyFullAccess,
        permission: { kind: 'FullAccess' },
        gasPayment: { source: 'KeyBalance', balance: yoctoNear('1000') },
        replayProtection: { scheme: 'NonceSequenceSet', totalSequences: 4 },
      },
      {
        publicKeyRef: gasKeyFunctionCall,
        permission: {
          kind: 'FunctionCall',
          allowedContract: 'contract.near',
          allowedFunctions: 'AllNonPayable',
        },
        gasPayment: { source: 'KeyBalance', balance: yoctoNear('2000') },
        replayProtection: { scheme: 'NonceSequenceSet', totalSequences: 1024 },
      },
    ]);
  });

  it('Invalid public key ref in the rpc result', async () => {
    // Answers like a node would, but with a 31-byte ml-dsa-65 hash
    const { fakeClient, close } = await startFakeRpc({
      keys: [
        {
          public_key: 'ml-dsa-65-hash:1111111111111111111111111111111',
          access_key: { nonce: 0, permission: 'FullAccess' },
        },
      ],
      block_hash: '11111111111111111111111111111111',
      block_height: 1,
    });
    const res = await fakeClient.safeGetAccessKeys({ accountId: 'nat' });
    close();

    assertNatErrKind(res, 'Client.GetAccessKeys.Exhausted');
    expect(
      isNatError(res.error, 'Client.GetAccessKeys.Exhausted') &&
        res.error.context.lastError.kind === 'SendRequest.Attempt.Response.InvalidSchema',
    ).toBe(true);
  });

  it('Invalid args', async () => {
    const res = await client.safeGetAccessKeys({
      accountId: 'nat###2%',
    });
    assertNatErrKind(res, 'Client.GetAccessKeys.Args.InvalidSchema');
  });

  it(`Fetch failed`, async () => {
    const brokenClient = createClient({
      transport: {
        rpcEndpoints: { regular: [{ url: 'http://localhost:0000' }] },
      },
    });
    const res = await brokenClient.safeGetAccessKeys({
      accountId: 'nat',
    });
    assertNatErrKind(res, 'Client.GetAccessKeys.Exhausted');

    expect(
      isNatError(res.error, 'Client.GetAccessKeys.Exhausted') &&
        res.error.context.lastError.kind === 'SendRequest.Attempt.Request.FetchFailed',
    ).toBe(true);
  });

  it('Non-existing account', async () => {
    const res = await client.getAccessKeys({
      accountId: 'nat-non-found',
    });
    expect(res.accessKeys.length).toBe(0);
  });
});
