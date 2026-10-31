import * as z from 'zod/mini';
import type { HasKeyPairErrorOf, Vault } from '../../../types/_common/vault';
import type { SafeHasKeyPair } from '../../../types/vaultSignService/hasKeyPair';
import type { VaultSignServiceContext } from '../../../types/vaultSignService/vaultSignService';
import { resultNatError } from '../../_common/_common/_common/result';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { PublicKeyZodSchema } from '../../_common/zodSchemas/publicKey';
import { PublicKeyIdZodSchema } from '../../_common/zodSchemas/publicKeyId';

const HasKeyPairArgsZodSchema = z.union([
  z.object({
    publicKey: PublicKeyZodSchema,
  }),
  z.object({
    publicKeyId: PublicKeyIdZodSchema,
  }),
]);

export const createSafeHasKeyPair = <V extends Vault>(
  context: VaultSignServiceContext<V>,
): SafeHasKeyPair<V> =>
  wrapInternalError('VaultSignService.HasKeyPair.Internal', async (args) => {
    const validArgs = HasKeyPairArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('VaultSignService.HasKeyPair.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const hasKeyPair = await context.vault.safeHasKeyPair(
      'publicKey' in validArgs.data
        ? { publicKey: validArgs.data.publicKey.publicKey }
        : { publicKeyId: validArgs.data.publicKeyId },
    );

    if (!hasKeyPair.success)
      return resultNatError('VaultSignService.HasKeyPair.Vault.Failed', {
        cause: hasKeyPair.error as HasKeyPairErrorOf<V>,
      });

    return hasKeyPair;
  });
