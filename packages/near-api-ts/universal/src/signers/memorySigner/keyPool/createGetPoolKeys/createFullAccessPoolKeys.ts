import type { AccountAccessKey, FullAccessKey } from '@universal/types/_common/accountAccessKey';
import type { PoolFullAccessKey } from '@universal/types/signers/memorySigner/inner/keyPool';
import type { MemorySignerContext } from '@universal/types/signers/memorySigner/memorySigner';
import { createLock, createSetNonce, createUnlock } from './keyUtils';

const transformKey = (fullAccessKey: FullAccessKey): PoolFullAccessKey => {
  const { publicKey, nonce } = fullAccessKey;

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

export const createFullAccessPoolKeys = (
  accountKeys: AccountAccessKey[],
  signerContext: MemorySignerContext,
): PoolFullAccessKey[] =>
  accountKeys
    .filter(
      ({ publicKey, accessType }) =>
        signerContext.keyService.safeFindKeyPair({ publicKey }).ok &&
        accessType === 'FullAccess',
    )
    .map((key) => transformKey(key as FullAccessKey));
