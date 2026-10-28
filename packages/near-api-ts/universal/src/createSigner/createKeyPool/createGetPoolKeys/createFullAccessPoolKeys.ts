import type { AccessKey } from '../../../../types/_common/accessKey';
import type { TransactionNonce } from '../../../../types/_common/common';
import type { PublicKey } from '../../../../types/_common/crypto';
import type { PoolFullAccessKey } from '../../../../types/signer/inner/keyPool';
import type { SignerContext } from '../../../../types/signer/signer';
import { createLock, createSetNonce, createUnlock } from './_common/keyUtils';

const transformKey = (nonce: TransactionNonce, publicKey: PublicKey): PoolFullAccessKey => {
  const key = {
    accessType: 'FullAccess',
    publicKey,
    isLocked: false,
    nonce,
  } as PoolFullAccessKey;

  key.lock = createLock(key);
  key.unlock = createUnlock(key);
  key.setNonce = createSetNonce(key);

  return key;
};

export const createFullAccessPoolKeys = async (
  accountKeys: AccessKey[],
  signerContext: SignerContext,
): Promise<PoolFullAccessKey[]> => {
  const filteredKeys = [];

  for (const key of accountKeys) {
    const { permission, replayProtection } = key;
    // The pool tracks one nonce per key, so it leaves out keys with a set of nonce channels
    if (permission.kind !== 'FullAccess' || replayProtection.scheme !== 'NonceChannel') continue;

    // We can sign only by a key the keyVault holds
    const hasKeyPair = await signerContext.keyVault.safeHasKeyPair({
      publicKeyId: key.publicKeyId,
    });

    if (!hasKeyPair.success || !hasKeyPair.data) continue;

    // The account refers to the key by its id, and we need the full public key to sign
    const publicKey = await signerContext.keyVault.safeGetPublicKey({
      publicKeyId: key.publicKeyId,
    });

    if (publicKey.success)
      filteredKeys.push(transformKey(replayProtection.lastNonce, publicKey.data));
  }

  return filteredKeys;
};
