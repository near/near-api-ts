import * as z from 'zod/mini';
import type { HasKeyPairErrorOf, SignDataErrorOf, Vault } from '../../../types/_common/vault';
import type { SafeSignDelegation } from '../../../types/vaultSignService/signDelegation';
import type { VaultSignServiceContext } from '../../../types/vaultSignService/vaultSignService';
import { resultNatError } from '../../_common/_common/_common/result';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { DelegationZodSchema } from '../../transaction/_common/delegationZodSchema';
import { safeSignDelegation } from '../../transaction/signDelegation';

const SignDelegationArgsZodSchema = z.object({
  delegation: DelegationZodSchema,
});

export const createSafeSignDelegation = <V extends Vault>(
  context: VaultSignServiceContext<V>,
): SafeSignDelegation<V> =>
  wrapInternalError('VaultSignService.SignDelegation.Internal', async (args) => {
    const validArgs = SignDelegationArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('VaultSignService.SignDelegation.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    // Each vault reports a key it doesn't hold in its own way, so we ask first
    // and report such a key the same way for any vault
    const { publicKey } = validArgs.data.delegation.delegator.publicKey;
    const hasKeyPair = await context.vault.safeHasKeyPair({ publicKey });

    if (!hasKeyPair.success)
      return resultNatError('VaultSignService.SignDelegation.Vault.Failed', {
        cause: hasKeyPair.error as HasKeyPairErrorOf<V>,
      });

    if (!hasKeyPair.data)
      return resultNatError('VaultSignService.SignDelegation.SigningKey.NotFound', { publicKey });

    const signedDelegation = await safeSignDelegation({
      delegation: args.delegation,
      signDataProvider: context.vault,
    });

    if (signedDelegation.success) return signedDelegation;

    if (signedDelegation.error.kind === 'SignDelegation.SignData.Failed')
      return resultNatError('VaultSignService.SignDelegation.Vault.Failed', {
        cause: signedDelegation.error.context.cause as SignDataErrorOf<V>,
      });

    // The delegation is valid already, so no other error is expected here
    return resultNatError('VaultSignService.SignDelegation.Internal', {
      cause: signedDelegation.error,
    });
  });
