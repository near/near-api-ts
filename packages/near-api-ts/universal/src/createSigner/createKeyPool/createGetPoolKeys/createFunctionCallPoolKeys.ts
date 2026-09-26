import type { AccountAccessKey, FunctionCallKey } from '../../../../types/_common/accountAccessKey';
import type { PublicKey } from '../../../../types/_common/crypto';
import type { PoolFunctionCallKey } from '../../../../types/signer/inner/keyPool';
import type { MemorySignerContext } from '../../../../types/signer/memorySigner';
import { createLock, createSetNonce, createUnlock } from './_common/keyUtils';

const transformKey = (
  functionCallKey: FunctionCallKey,
  publicKey: PublicKey,
): PoolFunctionCallKey => {
  const { nonce, contractAccountId, allowedFunctions } = functionCallKey;

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
    if (key.accessType !== 'FunctionCall') continue;

    // The account refers to the key by its ref, and we need the full public key to sign;
    // the keyService finds it only if it holds the key (we can sign data by it)
    const publicKey = await signerContext.keyService.safeFindPublicKey({
      publicKeyRef: key.publicKeyRef,
    });

    if (publicKey.success && publicKey.data) filteredKeys.push(transformKey(key, publicKey.data));
  }

  return filteredKeys;
};
