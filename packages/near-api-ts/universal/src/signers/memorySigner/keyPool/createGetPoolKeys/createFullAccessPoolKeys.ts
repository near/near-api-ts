import type {
  AccountAccessKey,
  FullAccessKey,
} from '../../../../../types/_common/accountAccessKey';
import type { PoolFullAccessKey } from '../../../../../types/signers/memorySigner/inner/keyPool';
import type { MemorySignerContext } from '../../../../../types/signers/memorySigner/memorySigner';
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

export const createFullAccessPoolKeys = async (
  accountKeys: AccountAccessKey[],
  signerContext: MemorySignerContext,
): Promise<PoolFullAccessKey[]> => {
  const filteredKeys = [];

  for (const key of accountKeys) {
    const isKey = await signerContext.keyService.safeHasKey(key);
    // If key exists in the keyService (we can sign data by it) and is full access
    if (isKey.ok && isKey.value === true && key.accessType === 'FullAccess') {
      filteredKeys.push(transformKey(key));
    }
  }

  return filteredKeys;
};
