import type { Nonce } from 'nat-types/_common/common';
import type { KeyPoolKey } from 'nat-types/signers/memorySigner/keyPool';

export const createLock = (key: KeyPoolKey) => () => {
  key.isLocked = true;
};

export const createUnlock = (key: KeyPoolKey) => () => {
  key.isLocked = false;
};

export const createSetNonce = (key: KeyPoolKey) => (newNonce: Nonce) => {
  key.nonce = newNonce;
};
