import { createUnlock, createLock, createSetNonce } from './helpers/keyUtils';
import type {
  AccountAccessKey,
  FullAccessKey,
} from 'nat-types/_common/accountAccessKey';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { KeyPoolFullAccessKey } from 'nat-types/signers/memorySigner/keyPool';

const transformKey = (fullAccessKey: FullAccessKey): KeyPoolFullAccessKey => {
  const { publicKey, nonce } = fullAccessKey;

  const key = {
    accessType: 'FullAccess',
    publicKey,
    isLocked: false,
    nonce,
  } as KeyPoolFullAccessKey;

  key.lock = createLock(key);
  key.unlock = createUnlock(key);
  key.setNonce = createSetNonce(key);

  return key;
};

export const getFullAccessKeyList = (
  accountKeys: AccountAccessKey[],
  signerContext: MemorySignerContext,
): KeyPoolFullAccessKey[] =>
  accountKeys
    .filter(
      ({ publicKey, accessType }) =>
        signerContext.keyService.safeFindKeyPair({ publicKey }).ok &&
        accessType === 'FullAccess',
    )
    .map((key) => transformKey(key as FullAccessKey));
