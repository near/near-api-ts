import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import * as z from 'zod/mini';
import { type Client, createMemoryVault, type MemoryVault, safeCreateSigner } from '../../../index';
import { assertNatErrKind } from '../../utils/assertNatErrKind';
import { createDefaultClient } from '../../utils/common';
import { startSandbox } from '../../utils/sandbox/startSandbox';

z.config(z.locales.en());
describe('createSigner', async () => {
  let client: Client;
  let keyVault: MemoryVault;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyVault = createMemoryVault({
      privateKeys: [DEFAULT_PRIVATE_KEY],
    });
    return () => sandbox.stop();
  });

  it('Default Ok', async () => {
    const signer = safeCreateSigner({
      signerAccountId: 'nat',
      client,
      keyVault,
    });
    expect(signer.success).toBe(true);
  });

  it('Ok with config', async () => {
    const signer = safeCreateSigner({
      signerAccountId: 'nat',
      client,
      keyVault,
      keyPool: {
        allowedAccessKeys: [DEFAULT_PUBLIC_KEY],
      },
      taskQueue: {
        timeoutMs: 1000,
      },
    });
    expect(signer.success).toBe(true);
  });

  it('CreateSigner.Args.InvalidSchema', async () => {
    const signer = safeCreateSigner({
      signerAccountId: 'nat',
      client: {
        // @ts-ignore
        sendSignedTransaction: () => {},
      },
      keyVault: {
        // @ts-ignore
        signTransaction: () => {},
      },
      keyPool: {
        allowedAccessKeys: [],
      },
      taskQueue: {
        timeoutMs: -1000,
      },
    });
    assertNatErrKind(signer, 'CreateSigner.Args.InvalidSchema');
  });

  // TODO move to executeTransaction
  // it('CreateSigner.Signer.AccessKeys.NotFound', async () => {
  //   const signer = safeCreateSigner({
  //     signerAccountId: 'nat-123',
  //     client,
  //     keyVault,
  //   });
  //   assertNatErrKind(signer, 'CreateSigner.Signer.AccessKeys.NotFound');
  // });
  //
  // it('CreateSigner.KeyPool.Empty', async () => {
  //   const signer = await safeCreateSigner({
  //     signerAccountId: 'nat',
  //     client,
  //     keyVault,
  //     keyPool: {
  //       allowedAccessKeys: [randomEd25519KeyPair().publicKey],
  //     },
  //   });
  //   assertNatErrKind(signer, 'CreateSigner.KeyPool.Empty');
  // });
});
