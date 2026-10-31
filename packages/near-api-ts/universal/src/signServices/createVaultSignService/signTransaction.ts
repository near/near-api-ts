import * as z from 'zod/mini';
import type { HasKeyPairErrorOf, SignDataErrorOf, Vault } from '../../../types/_common/vault';
import type { SafeSignTransaction } from '../../../types/vaultSignService/signTransaction';
import type { VaultSignServiceContext } from '../../../types/vaultSignService/vaultSignService';
import { resultNatError } from '../../_common/_common/_common/result';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { safeSignTransaction } from '../../transaction/signTransaction/signTransaction';
import { TransactionZodSchema } from '../../transaction/signTransaction/transactionZodSchema/transactionZodSchema';

const SignTransactionArgsZodSchema = z.object({
  transaction: TransactionZodSchema,
});

export const createSafeSignTransaction = <V extends Vault>(
  context: VaultSignServiceContext<V>,
): SafeSignTransaction<V> =>
  wrapInternalError('VaultSignService.SignTransaction.Internal', async (args) => {
    const validArgs = SignTransactionArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('VaultSignService.SignTransaction.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    // Each vault reports a key it doesn't hold in its own way, so we ask first
    // and report such a key the same way for any vault
    const { publicKey } = validArgs.data.transaction.signer.publicKey;
    const hasKeyPair = await context.vault.safeHasKeyPair({ publicKey });

    if (!hasKeyPair.success)
      return resultNatError('VaultSignService.SignTransaction.Vault.Failed', {
        cause: hasKeyPair.error as HasKeyPairErrorOf<V>,
      });

    if (!hasKeyPair.data)
      return resultNatError('VaultSignService.SignTransaction.KeyPair.NotFound', { publicKey });

    const signedTransaction = await safeSignTransaction({
      transaction: args.transaction,
      signDataProvider: context.vault,
    });

    if (signedTransaction.success) return signedTransaction;

    if (signedTransaction.error.kind === 'SignTransaction.SignData.Failed')
      return resultNatError('VaultSignService.SignTransaction.Vault.Failed', {
        cause: signedTransaction.error.context.cause as SignDataErrorOf<V>,
      });

    // The transaction is valid already, so no other error is expected here
    return resultNatError('VaultSignService.SignTransaction.Internal', {
      cause: signedTransaction.error,
    });
  });
