import { DEFAULT_PRIVATE_KEY, DEFAULT_PUBLIC_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import * as z from 'zod/mini';
import {
  type Client,
  createMemoryVault,
  createSigner,
  createVaultSignService,
  type MemoryVault,
  safeCreateSigner,
  transfer,
} from '../../../index';
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
      signService: createVaultSignService({ vault: keyVault }),
    });
    expect(signer.success).toBe(true);
  });

  it('Ok with config', async () => {
    const signer = safeCreateSigner({
      signerAccountId: 'nat',
      client,
      signService: createVaultSignService({ vault: keyVault }),
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
      signService: {
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

  it('executes a transaction through an object of just the client methods it needs', async () => {
    const signer = createSigner({
      signerAccountId: 'nat',
      client: {
        safeGetAccessKeys: client.safeGetAccessKeys,
        safeGetRecentBlockHash: client.safeGetRecentBlockHash,
        safeGetBlock: client.safeGetBlock,
        safeSendSignedTransaction: client.safeSendSignedTransaction,
      },
      signService: createVaultSignService({ vault: keyVault }),
    });

    const tx = await signer.safeExecuteTransaction({
      intent: {
        action: transfer({ amount: { yoctoNear: '1' } }),
        receiverAccountId: 'nat',
      },
    });
    expect(tx.success).toBe(true);
  });

  it('rejects a client that cannot send a transaction with Args.InvalidSchema', async () => {
    const signer = safeCreateSigner({
      signerAccountId: 'nat',
      // @ts-expect-error a signer can't send a transaction through such a client
      client: {
        safeGetAccessKeys: client.safeGetAccessKeys,
        safeGetRecentBlockHash: client.safeGetRecentBlockHash,
      },
      signService: createVaultSignService({ vault: keyVault }),
    });
    assertNatErrKind(signer, 'CreateSigner.Args.InvalidSchema');
  });

  it('rejects a vault as a sign service with Args.InvalidSchema', async () => {
    // A vault signs data, but not transactions
    const signer = safeCreateSigner({
      signerAccountId: 'nat',
      client,
      // @ts-expect-error a vault is not a sign service
      signService: keyVault,
    });
    assertNatErrKind(signer, 'CreateSigner.Args.InvalidSchema');
  });

  it('rejects a sign service that cannot sign a delegation with Args.InvalidSchema', async () => {
    const vaultSignService = createVaultSignService({ vault: keyVault });

    const signer = safeCreateSigner({
      signerAccountId: 'nat',
      client,
      // @ts-expect-error a signer can't sign a delegation through such a sign service
      signService: {
        safeHasKeyPair: vaultSignService.safeHasKeyPair,
        safeGetPublicKey: vaultSignService.safeGetPublicKey,
        safeSignTransaction: vaultSignService.safeSignTransaction,
      },
    });
    assertNatErrKind(signer, 'CreateSigner.Args.InvalidSchema');
  });
});
