import type { AccountAccessKey } from '../../../../types/_common/accountAccessKey';
import type { TransactionNonce } from '../../../../types/_common/common';
import type { PublicKey } from '../../../../types/_common/crypto';
import type { PoolFullAccessKey } from '../../../../types/signer/inner/keyPool';
import type { MemorySignerContext } from '../../../../types/signer/memorySigner';
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
  accountKeys: AccountAccessKey[],
  signerContext: MemorySignerContext,
): Promise<PoolFullAccessKey[]> => {
  const filteredKeys = [];

  for (const key of accountKeys) {
    const { permission, replayProtection } = key;
    // The pool tracks one nonce per key, so it leaves out keys with a set of nonce sequences
    if (permission.kind !== 'FullAccess' || replayProtection.scheme !== 'SingleNonceSequence')
      continue;

    // The account refers to the key by its ref, and we need the full public key to sign;
    // the keyService finds it only if it holds the key (we can sign data by it)
    const publicKey = await signerContext.keyService.safeFindPublicKey({
      publicKeyRef: key.publicKeyRef,
    });

    if (publicKey.success && publicKey.data)
      filteredKeys.push(transformKey(replayProtection.lastNonce, publicKey.data));
  }

  return filteredKeys;
};
