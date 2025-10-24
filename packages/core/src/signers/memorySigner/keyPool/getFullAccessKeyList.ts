import {
  createUnlock,
  createLock,
  createSetNonce,
} from './helpers/keyUtils';
import type { AccountKey, FullAccessKey } from 'nat-types/accountKey';
import type { SignerContext } from 'nat-types/signers/memorySigner';
import type { KeyPairs } from 'nat-types/keyServices/memoryKeyService';

const transformKey = (fullAccessKey: FullAccessKey, keyPairs: KeyPairs) => {
  const { publicKey, nonce } = fullAccessKey;

  const key: any = {
    type: 'FullAccess',
    publicKey,
    privateKey: keyPairs[publicKey],
    isLocked: false,
    nonce,
  };
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
