import { describe, expect, it } from 'vitest';
import {
  createMemoryVault,
  createVaultSignService,
  randomEd25519KeyPair,
  signDelegation,
  transfer,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('vaultSignService.signDelegation', () => {
  const keyPair = randomEd25519KeyPair();

  const delegation = {
    delegator: {
      accountId: 'alice',
      publicKey: keyPair.publicKey,
      replayProtection: { nonce: 7 },
    },
    receiverAccountId: 'bob',
    delegatedAction: transfer({ amount: { near: '1' } }),
    expiration: { blockHeight: 1000 },
  };

  it('signs a delegation by a key the vault holds', async () => {
    const signService = createVaultSignService({
      vault: createMemoryVault({ privateKey: keyPair.privateKey }),
    });

    // An ed25519 signature is deterministic, so the key pair itself signs the same way
    expect(await signService.signDelegation({ delegation })).toEqual(
      await signDelegation({ signDataProvider: keyPair, delegation }),
    );
  });

  it('fails with KeyPair.NotFound for a key the vault does not hold', async () => {
    const signService = createVaultSignService({ vault: createMemoryVault() });

    const signed = await signService.safeSignDelegation({ delegation });
    assertNatErrKind(signed, 'VaultSignService.SignDelegation.KeyPair.NotFound');
    expect(signed.error.context).toEqual({ publicKey: keyPair.publicKey });
  });

  it('rejects a call without args with Args.InvalidSchema', async () => {
    const signService = createVaultSignService({ vault: createMemoryVault() });

    // @ts-expect-error args are required
    const signed = await signService.safeSignDelegation();
    assertNatErrKind(signed, 'VaultSignService.SignDelegation.Args.InvalidSchema');
  });

  it('rejects an invalid delegation with Args.InvalidSchema', async () => {
    const signService = createVaultSignService({ vault: createMemoryVault() });

    const signed = await signService.safeSignDelegation({
      // @ts-expect-error not an account id
      delegation: { ...delegation, receiverAccountId: 1 },
    });
    assertNatErrKind(signed, 'VaultSignService.SignDelegation.Args.InvalidSchema');
  });

  it('fails with Vault.Failed when the vault fails to say if it holds the key', async () => {
    const signService = createVaultSignService({
      vault: {
        ...createMemoryVault({ privateKey: keyPair.privateKey }),
        safeHasKeyPair: async () => ({ success: false as const, error: 'Locked' as const }),
      },
    });

    const signed = await signService.safeSignDelegation({ delegation });
    assertNatErrKind(signed, 'VaultSignService.SignDelegation.Vault.Failed');
    expect(signed.error.context.cause).toBe('Locked');
  });

  it('fails with Vault.Failed when the vault fails to sign', async () => {
    // A vault that says it holds the key, but no longer holds it when it signs
    const signService = createVaultSignService({
      vault: {
        ...createMemoryVault(),
        safeHasKeyPair: async () => ({ success: true as const, data: true }),
      },
    });

    const signed = await signService.safeSignDelegation({ delegation });
    assertNatErrKind(signed, 'VaultSignService.SignDelegation.Vault.Failed');
    expect(signed.error.context.cause.kind).toBe('MemoryVault.SignData.KeyPair.NotFound');
  });
});
