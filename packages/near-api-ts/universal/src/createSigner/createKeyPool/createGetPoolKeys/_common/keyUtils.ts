import type { DelegationNonce, TransactionNonce } from '../../../../../types/_common/common';
import type { PoolKey } from '../../../../../types/signer/inner/keyPool';

export const createLock = (key: PoolKey) => () => {
  key.isLocked = true;
};

export const createUnlock = (key: PoolKey) => () => {
  key.isLocked = false;
};

export const createSetNonce = (key: PoolKey) => (newNonce: TransactionNonce) => {
  key.nonce = newNonce;
};

export const createSetLastDelegationNonce = (key: PoolKey) => (newNonce: DelegationNonce) => {
  key.lastDelegationNonce = newNonce;
};
