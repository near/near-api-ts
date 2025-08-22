import { createUnlock, createLock, createIncrementNonce } from './helpers/keyUtils';

const transformKey = (
  publicKey: any,
  accessKey: any,
  keyPairs: any,
  signerContext: any,
) => {
  const key: any = {
    permission: 'FullAccess',
    publicKey,
    privateKey: keyPairs[publicKey].privateKey,
    isLocked: false,
    nonce: accessKey.nonce,
  };
  key.lock = createLock(key);
  key.unlock = createUnlock(key, signerContext);
  key.incrementNonce = createIncrementNonce(key);

  return key;
};

export const getFullAccessKeyList = (
  accountKeys: any,
  keyPairs: any,
  signerContext: any,
) =>
  accountKeys
    .filter(
      ({ publicKey, accessKey }: any) =>
        Object.hasOwn(keyPairs, publicKey) &&
        accessKey.permission === 'FullAccess',
    )
    .map(({ publicKey, accessKey }: any) =>
      transformKey(publicKey, accessKey, keyPairs, signerContext),
    );
