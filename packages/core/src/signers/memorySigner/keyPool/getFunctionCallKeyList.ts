import {
  createIncrementNonce,
  createLock,
  createUnlock,
} from './helpers/keyUtils';
import type { AccountKey, FunctionCallKey } from 'nat-types/accountKey';
import type { SignerContext } from 'nat-types/signers/memorySigner';
import type { KeyPairs } from 'nat-types/keyServices/memoryKeyService';

const transformKey = (functionCallKey: FunctionCallKey, keyPairs: KeyPairs) => {
  const { publicKey, nonce, contractAccountId, allowedFunctions } =
    functionCallKey;

  const key: any = {
    type: 'FunctionCall',
    publicKey,
    privateKey: keyPairs[publicKey],
    isLocked: false,
    nonce,
    contractAccountId,
    allowedFunctions,
  };

  key.lock = createLock(key);
  key.unlock = createUnlock(key);
  key.incrementNonce = createIncrementNonce(key);

  return key;
};

export const getFunctionCallKeyList = (
  accountKeys: AccountKey[],
  signerContext: SignerContext,
) => {
  const keyPairs = signerContext.keyService.getKeyPairs();

  return accountKeys
    .filter(
      ({ publicKey, type }) =>
        Object.hasOwn(keyPairs, publicKey) && type === 'FunctionCall',
    )
    .map((key) => transformKey(key as FunctionCallKey, keyPairs));
};
