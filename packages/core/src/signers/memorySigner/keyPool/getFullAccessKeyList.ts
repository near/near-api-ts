import { createUnlock, createLock, createSetNonce } from './helpers/keyUtils';
import type { AccountKey, FullAccessKey } from 'nat-types/accountKey';
import type { SignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { KeyPairs } from 'nat-types/keyServices/memoryKeyService';
import type { KeyPoolFullAccessKey } from 'nat-types/signers/memorySigner/keyPool';

const transformKey = (
  fullAccessKey: FullAccessKey,
  keyPairs: KeyPairs,
): KeyPoolFullAccessKey => {
  const { publicKey, nonce } = fullAccessKey;

  const key = {
    accessType: 'FullAccess',
    publicKey,
    privateKey: keyPairs[publicKey],
    isLocked: false,
    nonce,
  } as KeyPoolFullAccessKey;

  key.lock = createLock(key);
  key.unlock = createUnlock(key);
  key.setNonce = createSetNonce(key);

  return key;
};

export const getFullAccessKeyList = (
  accountKeys: AccountKey[],
  signerContext: SignerContext,
) => {
  const keyPairs = signerContext.keyService.getKeyPairs();

  return accountKeys
    .filter(
      ({ publicKey, accessType }) =>
        Object.hasOwn(keyPairs, publicKey) && accessType === 'FullAccess',
    )
    .map((key) => transformKey(key as FullAccessKey, keyPairs));
};
