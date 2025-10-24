import type { Nonce } from 'nat-types/common';

export const createLock = (key: any) => () => {
  key.isLocked = true;
  console.log('Key locked', key.publicKey);
};

export const createUnlock = (key: any) => () => {
  key.isLocked = false;
  console.log('Key unlocked', key.publicKey);
};

export const createSetNonce = (key: any) => (newNonce: Nonce) => {
  key.nonce = newNonce;
  console.log(`Set new nonce '${newNonce}' for the key '${key.publicKey}'`);
};
