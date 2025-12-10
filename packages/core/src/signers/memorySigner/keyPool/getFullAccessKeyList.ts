import { createUnlock, createLock, createSetNonce } from './helpers/keyUtils';
import type { AccountAccessKey, FullAccessKey } from 'nat-types/_common/accountAccessKey';
import type { SignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { KeyPairs } from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import type { KeyPoolFullAccessKey } from 'nat-types/signers/memorySigner/keyPool';

const transformKey = (
  fullAccessKey: FullAccessKey,
  keyPairs: KeyPairs,
): KeyPoolFullAccessKey => {
  const { publicKey, nonce } = fullAccessKey;

  const key = {
    accessType: 'FullAccess',
    publicKey,
    privateKey: keyPairs[publicKey], // TODO Remove it!
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
