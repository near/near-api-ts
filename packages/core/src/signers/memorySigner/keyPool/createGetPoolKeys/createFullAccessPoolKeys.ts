import { createUnlock, createLock, createSetNonce } from './keyUtils';
import type {
  AccountAccessKey,
  FullAccessKey,
} from 'nat-types/_common/accountAccessKey';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { PoolFullAccessKey } from 'nat-types/signers/memorySigner/keyPool';

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
