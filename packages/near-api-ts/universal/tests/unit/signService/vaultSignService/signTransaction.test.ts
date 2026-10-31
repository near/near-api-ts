import { describe, expect, it } from 'vitest';
import {
  createMemoryVault,
  createVaultSignService,
  randomEd25519KeyPair,
  signTransaction,
} from '../../../../index';
import type { Transaction } from '../../../../types/_common/transaction/transaction';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('vaultSignService.signTransaction', () => {
  const keyPair = randomEd25519KeyPair();

  const transaction: Transaction = {
    signer: {
      accountId: 'bob',
      publicKey: keyPair.publicKey,
      replayProtection: { scheme: 'NonceChannel', nonce: 0 },
    },
    action: {
      actionType: 'Transfer',
      amount: { near: '1' },
    },
    receiverAccountId: 'alice',
    recentBlockHash: 'EDhhHZrpcbJ4RrswFrcsPjww9oa6LTruF5Q4Hq2dXYwP',
  };

  it('signs a transaction by a key the vault holds', async () => {
    const signService = createVaultSignService({
      vault: createMemoryVault({ privateKey: keyPair.privateKey }),
    });

    // An ed25519 signature is deterministic, so the key pair itself signs the same way
    expect(await signService.signTransaction({ transaction })).toEqual(
      await signTransaction({ signDataProvider: keyPair, transaction }),
    );
  });

  it('fails with SigningKey.NotFound for a key the vault does not hold', async () => {
    const signService = createVaultSignService({ vault: createMemoryVault() });

    const signed = await signService.safeSignTransaction({ transaction });
    assertNatErrKind(signed, 'VaultSignService.SignTransaction.SigningKey.NotFound');
    expect(signed.error.context).toEqual({ publicKey: keyPair.publicKey });
  });

  it('rejects a call without args with Args.InvalidSchema', async () => {
    const signService = createVaultSignService({ vault: createMemoryVault() });

    // @ts-expect-error args are required
    const signed = await signService.safeSignTransaction();
    assertNatErrKind(signed, 'VaultSignService.SignTransaction.Args.InvalidSchema');
  });

  it('rejects an invalid transaction with Args.InvalidSchema', async () => {
    const signService = createVaultSignService({ vault: createMemoryVault() });

    const signed = await signService.safeSignTransaction({
      // @ts-expect-error not an account id
      transaction: { ...transaction, receiverAccountId: 1 },
    });
    assertNatErrKind(signed, 'VaultSignService.SignTransaction.Args.InvalidSchema');
  });

  it('fails with Vault.Failed when the vault fails to say if it holds the key', async () => {
    const signService = createVaultSignService({
      vault: {
        ...createMemoryVault({ privateKey: keyPair.privateKey }),
        safeHasKeyPair: async () => ({ success: false as const, error: 'Locked' as const }),
      },
    });

    const signed = await signService.safeSignTransaction({ transaction });
    assertNatErrKind(signed, 'VaultSignService.SignTransaction.Vault.Failed');
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

    const signed = await signService.safeSignTransaction({ transaction });
    assertNatErrKind(signed, 'VaultSignService.SignTransaction.Vault.Failed');
    expect(signed.error.context.cause.kind).toBe('MemoryVault.SignData.SigningKey.NotFound');
  });
});
