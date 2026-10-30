import type { AccessKey } from '../../../../types/_common/accessKey';
import type { Result, TransactionNonce } from '../../../../types/_common/common';
import type { PublicKey } from '../../../../types/_common/crypto';
import type { PoolFullAccessKey } from '../../../../types/signer/inner/keyPool';
import type { SignerContext } from '../../../../types/signer/signer';
import type { NatError } from '../../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../../_common/_common/_common/result';
import { isAccountBalanceKey } from './_common/isAccountBalanceKey';
import { createLock, createSetNonce, createUnlock } from './_common/keyUtils';

const transformKey = (nonce: TransactionNonce, publicKey: PublicKey): PoolFullAccessKey => {
  const key = {
    accessType: 'FullAccess',
    publicKey,
    isLocked: false,
    nonce,
  } as PoolFullAccessKey;

  key.lock = createLock(key);
  key.unlock = createUnlock(key);
  key.setNonce = createSetNonce(key);

  return key;
};

export const createFullAccessPoolKeys = async (
  accountKeys: AccessKey[],
  signerContext: SignerContext,
): Promise<Result<PoolFullAccessKey[], NatError<'Signer.KeyPool.SignService.Failed'>>> => {
  const filteredKeys = [];

  for (const key of accountKeys) {
    if (!isAccountBalanceKey(key)) continue;

    const { permission, replayProtection } = key;
    if (permission.kind !== 'FullAccess') continue;

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

    filteredKeys.push(transformKey(replayProtection.lastNonce, publicKey.data));
  }

  return result.ok(filteredKeys);
};
