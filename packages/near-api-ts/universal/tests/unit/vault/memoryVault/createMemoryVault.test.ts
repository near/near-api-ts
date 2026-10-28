import { describe, expect, it } from 'vitest';
import { createMemoryVault, randomEd25519KeyPair, safeCreateMemoryVault } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('createMemoryVault', () => {
  it('creates a vault holding the key pair of its private key', async () => {
    const kp = randomEd25519KeyPair();
    const vault = createMemoryVault({ privateKey: kp.privateKey });

    expect(await vault.hasKeyPair({ publicKey: kp.publicKey })).toBe(true);
  });

  it('creates a vault holding the key pairs of its private keys', async () => {
    const kp1 = randomEd25519KeyPair();
    const kp2 = randomEd25519KeyPair();
    const vault = createMemoryVault({ privateKeys: [kp1.privateKey, kp2.privateKey] });

    expect(await vault.hasKeyPair({ publicKey: kp1.publicKey })).toBe(true);
    expect(await vault.hasKeyPair({ publicKey: kp2.publicKey })).toBe(true);
  });

  it('creates an empty vault without private keys', async () => {
    const vault = createMemoryVault();
    expect(await vault.hasKeyPair({ publicKey: randomEd25519KeyPair().publicKey })).toBe(false);
  });

  it('creates an empty vault from an empty list of private keys', async () => {
    const vault = createMemoryVault({ privateKeys: [] });
    expect(await vault.hasKeyPair({ publicKey: randomEd25519KeyPair().publicKey })).toBe(false);
  });

  it('rejects an invalid private key with Args.InvalidSchema', () => {
    const vault = safeCreateMemoryVault({
      // @ts-expect-error not a private key
      privateKey: 'private-key',
    });
    assertNatErrKind(vault, 'CreateMemoryVault.Args.InvalidSchema');
  });
});
