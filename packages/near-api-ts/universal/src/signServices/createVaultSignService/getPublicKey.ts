import * as z from 'zod/mini';
import type { GetPublicKeyErrorOf, HasKeyPairErrorOf, Vault } from '../../../types/_common/vault';
import type { SafeGetPublicKey } from '../../../types/vaultSignService/getPublicKey';
import type { VaultSignServiceContext } from '../../../types/vaultSignService/vaultSignService';
import { resultNatError } from '../../_common/_common/_common/result';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { PublicKeyIdZodSchema } from '../../_common/zodSchemas/publicKeyId';

const GetPublicKeyArgsZodSchema = z.object({
  publicKeyId: PublicKeyIdZodSchema,
});

export const createSafeGetPublicKey = <V extends Vault>(
  context: VaultSignServiceContext<V>,
): SafeGetPublicKey<V> =>
  wrapInternalError('VaultSignService.GetPublicKey.Internal', async (args) => {
    const validArgs = GetPublicKeyArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('VaultSignService.GetPublicKey.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const { publicKeyId } = validArgs.data;

    // Each vault reports a key it doesn't hold in its own way, so we ask first
    // and report such a key the same way for any vault
    const hasKeyPair = await context.vault.safeHasKeyPair({ publicKeyId });

    if (!hasKeyPair.success)
      return resultNatError('VaultSignService.GetPublicKey.Vault.Failed', {
        cause: hasKeyPair.error as HasKeyPairErrorOf<V>,
      });

    if (!hasKeyPair.data)
      return resultNatError('VaultSignService.GetPublicKey.PublicKey.NotFound', { publicKeyId });

    const publicKey = await context.vault.safeGetPublicKey({ publicKeyId });

    if (!publicKey.success)
      return resultNatError('VaultSignService.GetPublicKey.Vault.Failed', {
        cause: publicKey.error as GetPublicKeyErrorOf<V>,
      });

    return publicKey;
  });
