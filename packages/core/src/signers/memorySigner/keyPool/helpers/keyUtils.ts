import type { Nonce } from 'nat-types/_common/common';
import type { KeyPoolKey } from 'nat-types/signers/memorySigner/keyPool';

export const createLock = (key: KeyPoolKey) => () => {
  key.isLocked = true;
  console.log('Key locked', key.publicKey);
};

export const createUnlock = (key: KeyPoolKey) => () => {
  key.isLocked = false;
  console.log('Key unlocked', key.publicKey);
};

export const createSetNonce = (key: KeyPoolKey) => (newNonce: Nonce) => {
  key.nonce = newNonce;
  console.log(`Set new nonce '${newNonce}' for the key '${key.publicKey}'`);
};
