import { createSetNonce, createLock, createUnlock } from './keyUtils';
import type {
  AccountAccessKey,
  FunctionCallKey,
} from '../../../../../types/_common/accountAccessKey';
import type { MemorySignerContext } from '../../../../../types/signers/memorySigner/memorySigner';
import type { PoolFunctionCallKey } from '../../../../../types/signers/memorySigner/keyPool';

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
