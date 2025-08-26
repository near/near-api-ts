import {
  createUnlock,
  createLock,
  createIncrementNonce,
} from './helpers/keyUtils';
import type { AccountKey, FullAccessKey } from 'nat-types/accountKey';

const transformKey = (
  fullAccessKey: FullAccessKey,
  keyPairs: any,
  signerContext: any,
) => {
  const { publicKey, nonce } = fullAccessKey;

  const key: any = {
    type: 'FullAccess',
    publicKey,
    privateKey: keyPairs[publicKey].privateKey,
    isLocked: false,
    nonce,
  };
  key.lock = createLock(key);
  key.unlock = createUnlock(key, signerContext);
  key.incrementNonce = createIncrementNonce(key);

  return key;
};

export const getFullAccessKeyList = (
  accountKeys: AccountKey[],
  keyPairs: any,
  signerContext: any,
) =>
  accountKeys
    .filter(
      ({ publicKey, type }) =>
        Object.hasOwn(keyPairs, publicKey) && type === 'FullAccess',
    )
    .map((key) => transformKey(key as FullAccessKey, keyPairs, signerContext));
