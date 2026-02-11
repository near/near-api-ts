import type { Nonce } from '../../../../../types/_common/common';
import type { PoolKey } from '../../../../../types/signers/memorySigner/keyPool';

export const createLock = (key: PoolKey) => () => {
  key.isLocked = true;
};

export const createUnlock = (key: PoolKey) => () => {
  key.isLocked = false;
};

export const createSetNonce = (key: PoolKey) => (newNonce: Nonce) => {
  key.nonce = newNonce;
};
