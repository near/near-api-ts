import type { AccountAccessKey, FunctionCallKey } from '@universal/types/_common/accountAccessKey';
import type { PoolFunctionCallKey } from '@universal/types/signers/memorySigner/inner/keyPool';
import type { MemorySignerContext } from '@universal/types/signers/memorySigner/memorySigner';
import { createLock, createSetNonce, createUnlock } from './keyUtils';

const transformKey = (
  functionCallKey: FunctionCallKey,
): PoolFunctionCallKey => {
  const { publicKey, nonce, contractAccountId, allowedFunctions } =
    functionCallKey;

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

export const createFunctionCallPoolKeys = (
  accountKeys: AccountAccessKey[],
  signerContext: MemorySignerContext,
): PoolFunctionCallKey[] =>
  accountKeys
    .filter(
      ({ publicKey, accessType }) =>
        signerContext.keyService.safeFindKeyPair({ publicKey }).ok &&
        accessType === 'FunctionCall',
    )
    .map((key) => transformKey(key as FunctionCallKey));
