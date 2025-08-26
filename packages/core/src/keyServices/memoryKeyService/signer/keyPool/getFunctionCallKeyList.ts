import {
  createIncrementNonce,
  createLock,
  createUnlock,
} from './helpers/keyUtils';
import type { AccountKey, FunctionCallKey } from 'nat-types/accountKey';

const transformKey = (
  functionCallKey: FunctionCallKey,
  keyPairs: any,
  signerContext: any,
) => {
  const { publicKey, nonce, contractAccountId, allowedFunctions } =
    functionCallKey;

  const key: any = {
    permission: 'FunctionCall',
    publicKey,
    privateKey: keyPairs[publicKey].privateKey,
    isLocked: false,
    nonce,
    contractAccountId,
    allowedFunctions,
  };

  key.lock = createLock(key);
  key.unlock = createUnlock(key, signerContext);
  key.incrementNonce = createIncrementNonce(key);

  return key;
};

export const getFunctionCallKeyList = (
  accountKeys: AccountKey[],
  keyPairs: any,
  signerContext: any,
) =>
  accountKeys
    .filter(
      ({ publicKey, type }) =>
        Object.hasOwn(keyPairs, publicKey) && type === 'FunctionCall',
    )
    .map((key) =>
      transformKey(key as FunctionCallKey, keyPairs, signerContext),
    );
