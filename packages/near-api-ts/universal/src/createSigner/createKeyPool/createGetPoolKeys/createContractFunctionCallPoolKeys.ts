import type {
  AccessKey,
  AccountBalanceContractFunctionCallKey,
} from '../../../../types/_common/accessKey';
import type { Result, TransactionNonce } from '../../../../types/_common/common';
import type { PublicKey } from '../../../../types/_common/crypto';
import type { PoolContractFunctionCallKey } from '../../../../types/signer/inner/keyPool';
import type { SignerContext } from '../../../../types/signer/signer';
import type { NatError } from '../../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../../_common/_common/_common/result';
import { isAccountBalanceKey } from './_common/isAccountBalanceKey';
import {
  createLock,
  createSetLastDelegationNonce,
  createSetNonce,
  createUnlock,
} from './_common/keyUtils';

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
  key.setLastDelegationNonce = createSetLastDelegationNonce(key);

  return key;
};

export const createContractFunctionCallPoolKeys = async (
  accountKeys: AccessKey[],
  signerContext: SignerContext,
): Promise<
  Result<PoolContractFunctionCallKey[], NatError<'Signer.KeyPool.SignService.Failed'>>
> => {
  const filteredKeys = [];

  for (const key of accountKeys) {
    if (!isAccountBalanceKey(key)) continue;

    const { permission, replayProtection } = key;
    if (permission.kind !== 'ContractFunctionCall') continue;

    // We can sign only by a key the signService holds
    const hasKeyPair = await signerContext.signService.safeHasKeyPair({
      publicKeyId: key.publicKeyId,
    });

    if (!hasKeyPair.success)
      return resultNatError('Signer.KeyPool.SignService.Failed', { cause: hasKeyPair.error });

    if (!hasKeyPair.data) continue;

    // The account refers to the key by its id, and we need the full public key to sign
    const publicKey = await signerContext.signService.safeGetPublicKey({
      publicKeyId: key.publicKeyId,
    });

    if (!publicKey.success)
      return resultNatError('Signer.KeyPool.SignService.Failed', { cause: publicKey.error });

    filteredKeys.push(transformKey(permission, replayProtection.lastNonce, publicKey.data));
  }

  return result.ok(filteredKeys);
};
