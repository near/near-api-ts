import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  addFullAccessKey,
  type Client,
  createClient,
  createMemoryKeyService,
  createMemorySigner,
  isNatError,
  randomMlDsa65KeyPair,
  randomSecp256k1KeyPair,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../utils/common';
import { startSandbox } from '../../../utils/sandbox/startSandbox';

describe('Get Account Access Keys', () => {
  let client: Client;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('Ok', async () => {
    const res = await client.getAccountAccessKeys({
      accountId: 'nat',
    });
    expect(res.accountAccessKeys[0]).toEqual({
      accessType: 'FullAccess',
      publicKeyRef: DEFAULT_PUBLIC_KEY,
      nonce: 0,
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

    const { accountAccessKeys } = await client.getAccountAccessKeys({ accountId: 'nat' });

    expect(accountAccessKeys.map(({ publicKeyRef }) => publicKeyRef).sort()).toEqual(
      [DEFAULT_PUBLIC_KEY, secp256k1KeyPair.publicKey, mlDsa65KeyPair.publicKeyRef].sort(),
    );
    expect(mlDsa65KeyPair.publicKeyRef).toMatch(/^ml-dsa-65-hash:/);
  });

  it('Invalid public key ref in the rpc result', async () => {
    // Answers like a node would, but with a 31-byte ml-dsa-65 hash
    const server = createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        res.setHeader('content-type', 'application/json');
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: JSON.parse(body).id,
            result: {
              keys: [
                {
                  public_key: 'ml-dsa-65-hash:1111111111111111111111111111111',
                  access_key: { nonce: 0, permission: 'FullAccess' },
                },
              ],
              block_hash: '11111111111111111111111111111111',
              block_height: 1,
            },
          }),
        );
      });
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;

    const fakeClient = createClient({
      transport: { rpcEndpoints: { regular: [{ url: `http://localhost:${port}` }] } },
    });
    const res = await fakeClient.safeGetAccountAccessKeys({ accountId: 'nat' });
    server.close();

    assertNatErrKind(res, 'Client.GetAccountAccessKeys.Exhausted');
    expect(
      isNatError(res.error, 'Client.GetAccountAccessKeys.Exhausted') &&
        res.error.context.lastError.kind === 'SendRequest.Attempt.Response.InvalidSchema',
    ).toBe(true);
  });

  it('Invalid args', async () => {
    const res = await client.safeGetAccountAccessKeys({
      accountId: 'nat###2%',
    });
    assertNatErrKind(res, 'Client.GetAccountAccessKeys.Args.InvalidSchema');
  });

  it(`Fetch failed`, async () => {
    const brokenClient = createClient({
      transport: {
        rpcEndpoints: { regular: [{ url: 'http://localhost:0000' }] },
      },
    });
    const res = await brokenClient.safeGetAccountAccessKeys({
      accountId: 'nat',
    });
    assertNatErrKind(res, 'Client.GetAccountAccessKeys.Exhausted');

    expect(
      isNatError(res.error, 'Client.GetAccountAccessKeys.Exhausted') &&
        res.error.context.lastError.kind === 'SendRequest.Attempt.Request.FetchFailed',
    ).toBe(true);
  });

  it('Non-existing account', async () => {
    const res = await client.getAccountAccessKeys({
      accountId: 'nat-non-found',
    });
    expect(res.accountAccessKeys.length).toBe(0);
  });
});
