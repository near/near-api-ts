import type {
  AccountAccessKey,
  FunctionCallKey,
} from '../../../../../types/_common/accountAccessKey';
import type { PoolFunctionCallKey } from '../../../../../types/signers/memorySigner/inner/keyPool';
import type { MemorySignerContext } from '../../../../../types/signers/memorySigner/memorySigner';
import { createLock, createSetNonce, createUnlock } from './keyUtils';

const transformKey = (functionCallKey: FunctionCallKey): PoolFunctionCallKey => {
  const { publicKey, nonce, contractAccountId, allowedFunctions } = functionCallKey;

  const key = {
    accessType: 'FunctionCall',
    publicKey,
    isLocked: false,
    nonce,
    contractAccountId,
    allowedFunctions,
  } as PoolFunctionCallKey;

  key.lock = createLock(key);
  key.unlock = createUnlock(key);
  key.setNonce = createSetNonce(key);

  return key;
};

export const createFunctionCallPoolKeys = async (
  accountKeys: AccountAccessKey[],
  signerContext: MemorySignerContext,
): Promise<PoolFunctionCallKey[]> => {
  const filteredKeys = [];

  for (const key of accountKeys) {
    const isKey = await signerContext.keyService.safeHasKey(key);
    // If key exists in the keyService (we can sign data by it) and is full access
    if (isKey.ok && isKey.value === true && key.accessType === 'FunctionCall') {
      filteredKeys.push(transformKey(key));
    }
  }

  return filteredKeys;
};
