import type {
  AccessKey,
  AccountBalanceContractFunctionCallKey,
} from '../../../../types/_common/accessKey';
import type { TransactionNonce } from '../../../../types/_common/common';
import type { PublicKey } from '../../../../types/_common/crypto';
import type { PoolContractFunctionCallKey } from '../../../../types/signer/inner/keyPool';
import type { SignerContext } from '../../../../types/signer/signer';
import { createLock, createSetNonce, createUnlock } from './_common/keyUtils';

const transformKey = (
  { allowedContract, allowedFunctions }: AccountBalanceContractFunctionCallKey['permission'],
  nonce: TransactionNonce,
  publicKey: PublicKey,
): PoolContractFunctionCallKey => {
  const key = {
    accessType: 'ContractFunctionCall',
    publicKey,
    isLocked: false,
    nonce,
    contractAccountId: allowedContract,
    allowedFunctions,
  } as PoolContractFunctionCallKey;

  key.lock = createLock(key);
  key.unlock = createUnlock(key);
  key.setNonce = createSetNonce(key);

  return key;
};

export const createContractFunctionCallPoolKeys = async (
  accountKeys: AccessKey[],
  signerContext: SignerContext,
): Promise<PoolContractFunctionCallKey[]> => {
  const filteredKeys = [];

  for (const key of accountKeys) {
    const { permission, replayProtection } = key;
    // The pool tracks one nonce per key, so it leaves out keys with a set of nonce channels
    if (permission.kind !== 'ContractFunctionCall' || replayProtection.scheme !== 'NonceChannel')
      continue;

    // The account refers to the key by its id, and we need the full public key to sign;
    // the keyVault finds it only if it holds the key (we can sign data by it)
    const publicKey = await signerContext.keyVault.safeFindPublicKey({
      publicKeyId: key.publicKeyId,
    });

    if (publicKey.success && publicKey.data)
      filteredKeys.push(transformKey(permission, replayProtection.lastNonce, publicKey.data));
  }

  return filteredKeys;
};
