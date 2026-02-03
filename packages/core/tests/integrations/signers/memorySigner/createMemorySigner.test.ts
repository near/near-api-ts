import * as z from 'zod/mini';
import { vi, expect, it, describe, beforeAll } from 'vitest';
import { startSandbox } from '../../../utils/sandbox/startSandbox';
import {
  type Client,
  createMemoryKeyService,
  type MemoryKeyService,
  safeCreateMemorySigner,
} from '../../../../src';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';
import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { createDefaultClient } from '../../../utils/common';

z.config(z.locales.en());
vi.setConfig({ testTimeout: 60000 });

describe('createMemorySigner', async () => {
  let client: Client;
  let keyService: MemoryKeyService;

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    keyService = createMemoryKeyService({
      keySources: [{ privateKey: DEFAULT_PRIVATE_KEY }],
    });
    return () => sandbox.stop();
  });

  it('Default Ok', async () => {
    const signer = safeCreateMemorySigner({
      signerAccountId: 'nat',
      client,
      keyService,
    });
    expect(signer.ok).toBe(true);
  });

  it('Ok with config', async () => {
    const signer = safeCreateMemorySigner({
      signerAccountId: 'nat',
      client,
      keyService,
      keyPool: {
        allowedAccessKeys: [DEFAULT_PUBLIC_KEY],
      },
      taskQueue: {
        timeoutMs: 1000,
      },
    });
    expect(signer.ok).toBe(true);
  });

  it('CreateMemorySigner.Args.InvalidSchema', async () => {
    const signer = safeCreateMemorySigner({
      signerAccountId: 'nat',
      client: {
        // @ts-ignore
        sendSignedTransaction: () => {},
      },
      keyService: {
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
    assertNatErrKind(signer, 'CreateMemorySigner.Args.InvalidSchema');
  });

  // TODO move to executeTransaction
  // it('CreateMemorySigner.Signer.AccessKeys.NotFound', async () => {
  //   const signer = safeCreateMemorySigner({
  //     signerAccountId: 'nat-123',
  //     client,
  //     keyService,
  //   });
  //   assertNatErrKind(signer, 'CreateMemorySigner.Signer.AccessKeys.NotFound');
  // });
  //
  // it('CreateMemorySigner.KeyPool.Empty', async () => {
  //   const signer = await safeCreateMemorySigner({
  //     signerAccountId: 'nat',
  //     client,
  //     keyService,
  //     keyPool: {
  //       allowedAccessKeys: [randomEd25519KeyPair().publicKey],
  //     },
  //   });
  //   assertNatErrKind(signer, 'CreateMemorySigner.KeyPool.Empty');
  // });
});
