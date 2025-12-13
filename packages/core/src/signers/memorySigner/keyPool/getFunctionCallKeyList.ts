import { createSetNonce, createLock, createUnlock } from './helpers/keyUtils';
import type {
  AccountAccessKey,
  FunctionCallKey,
} from 'nat-types/_common/accountAccessKey';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { KeyPoolFunctionCallKey } from 'nat-types/signers/memorySigner/keyPool';

const transformKey = (
  functionCallKey: FunctionCallKey,
): KeyPoolFunctionCallKey => {
  const { publicKey, nonce, contractAccountId, allowedFunctions } =
    functionCallKey;

  const key = {
    accessType: 'FunctionCall',
    publicKey,
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
  signerContext: MemorySignerContext,
): KeyPoolFunctionCallKey[] =>
  accountKeys
    .filter(
      ({ publicKey, accessType }) =>
        signerContext.keyService.safeFindKeyPair({ publicKey }).ok &&
        accessType === 'FunctionCall',
    )
    .map((key) => transformKey(key as FunctionCallKey));
