export const createLock = (key: any) => () => {
  key.isLocked = true;
  console.log('Key locked', key.publicKey);
};

export const createUnlock = (key: any) => () => {
  key.isLocked = false;
  console.log('Key unlocked', key.publicKey);
};

export const createIncrementNonce = (key: any) => () => {
  key.nonce = key.nonce + 1;
};
