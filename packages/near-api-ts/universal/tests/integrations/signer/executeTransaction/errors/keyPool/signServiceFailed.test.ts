import { DEFAULT_PRIVATE_KEY } from 'near-sandbox';
import { beforeAll, describe, expect, it } from 'vitest';
import * as z from 'zod/mini';
import {
  type Client,
  createMemoryVault,
  createSigner,
  createVaultSignService,
  transfer,
} from '../../../../../../index';
import type { HasKeyPairArgs } from '../../../../../../types/_common/vault';
import { assertNatErrKind } from '../../../../../utils/assertNatErrKind';
import { createDefaultClient } from '../../../../../utils/common';
import { startSandbox } from '../../../../../utils/sandbox/startSandbox';

z.config(z.locales.en());
describe('executeTransaction › KeyPool.SignService.Failed', async () => {
  let client: Client;

  const intent = {
    action: transfer({ amount: { yoctoNear: '1' } }),
    receiverAccountId: 'nat',
  };

  // A sign service that can't answer while it is locked, as one behind a password would
  const createLockableSignService = () => {
    const lock = { isLocked: true };
    const vaultSignService = createVaultSignService({
      vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
    });

    const signService = {
      ...vaultSignService,
      safeHasKeyPair: async (args: HasKeyPairArgs) =>
        lock.isLocked
          ? { success: false as const, error: 'Locked' as const }
          : vaultSignService.safeHasKeyPair(args),
    };

    return { lock, signService };
  };

  beforeAll(async () => {
    const sandbox = await startSandbox();
    client = createDefaultClient(sandbox);
    return () => sandbox.stop();
  });

  it('fails with KeyPool.SignService.Failed when the sign service fails to say if it holds a key', async () => {
    const { signService } = createLockableSignService();
    const nat = createSigner({ signerAccountId: 'nat', client, signService });

    const tx = await nat.safeExecuteTransaction({ intent });
    assertNatErrKind(tx, 'Signer.ExecuteTransaction.KeyPool.SignService.Failed');
    expect(tx.error.context.cause).toBe('Locked');
  });

  it('fails with KeyPool.SignService.Failed when the sign service fails to give a public key', async () => {
    const vaultSignService = createVaultSignService({
      vault: createMemoryVault({ privateKey: DEFAULT_PRIVATE_KEY }),
    });

    const nat = createSigner({
      signerAccountId: 'nat',
      client,
      signService: {
        ...vaultSignService,
        safeGetPublicKey: async () => ({ success: false as const, error: 'Locked' as const }),
      },
    });

    const signed = await nat.safeSignTransaction({ intent });
    assertNatErrKind(signed, 'Signer.SignTransaction.KeyPool.SignService.Failed');
    expect(signed.error.context.cause).toBe('Locked');
  });

  it('loads the keys again once the sign service answers', async () => {
    const { lock, signService } = createLockableSignService();
    const nat = createSigner({ signerAccountId: 'nat', client, signService });

    const failed = await nat.safeExecuteTransaction({ intent });
    assertNatErrKind(failed, 'Signer.ExecuteTransaction.KeyPool.SignService.Failed');

    lock.isLocked = false;

    const executed = await nat.safeExecuteTransaction({ intent });
    expect(executed.success).toBe(true);
  });
});
