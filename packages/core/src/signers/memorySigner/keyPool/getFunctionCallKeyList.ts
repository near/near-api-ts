import { createSetNonce, createLock, createUnlock } from './helpers/keyUtils';
import type { AccountAccessKey, FunctionCallKey } from 'nat-types/_common/accountAccessKey';
import type { SignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { KeyPairs } from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import type { KeyPoolFunctionCallKey } from 'nat-types/signers/memorySigner/keyPool';

const transformKey = (
  functionCallKey: FunctionCallKey,
  keyPairs: KeyPairs,
): KeyPoolFunctionCallKey => {
  const { publicKey, nonce, contractAccountId, allowedFunctions } =
    functionCallKey;

  const key = {
    accessType: 'FunctionCall',
    publicKey,
    privateKey: keyPairs[publicKey],
    isLocked: false,
    nonce,
    contractAccountId,
    allowedFunctions,
  } as KeyPoolFunctionCallKey;

  key.lock = createLock(key);
  key.unlock = createUnlock(key);
  key.setNonce = createSetNonce(key);

  return key;
};

export const getFunctionCallKeyList = (
  accountKeys: AccountAccessKey[],
  signerContext: SignerContext,
) => {
  const keyPairs = signerContext.keyService.getKeyPairs();

  return accountKeys
    .filter(
      ({ publicKey, accessType }) =>
        Object.hasOwn(keyPairs, publicKey) && accessType === 'FunctionCall',
    )
    .map((key) => transformKey(key as FunctionCallKey, keyPairs));
};
