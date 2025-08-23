export const createLock = (key: any) => () => {
  key.isLocked = true;
  console.log('Key locked', key.publicKey);
};

export const createUnlock = (key: any, signerContext: any) => () => {
  key.isLocked = false;
  console.log('Key unlocked', key.publicKey);
  signerContext.matcher.handleKeyUnlock(key);
};

export const createIncrementNonce = (key: any) => () => {
  key.nonce = key.nonce + 1n;
};
