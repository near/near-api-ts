import * as z from 'zod/mini';
import { getTransactionHash } from '../../_common/utils/getTransactionHash';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';
import type { MemoryKeyServiceContext } from '../../../types/keyServices/memoryKeyService/memoryKeyService';
import { createNatError } from '../../_common/natError';
import type { SafeSignTransaction } from '../../../types/keyServices/memoryKeyService/createSignTransaction';
import { TransactionSchema } from '../../_common/schemas/zod/transaction/transaction';

const SignTransactionArgsSchema = z.object({
  transaction: TransactionSchema,
});

export const createSafeSignTransaction = (
  context: MemoryKeyServiceContext,
): SafeSignTransaction =>
  wrapInternalError(
    'MemoryKeyService.SignTransaction.Internal',
    async (args) => {
      const validArgs = SignTransactionArgsSchema.safeParse(args);

      if (!validArgs.success)
        return result.err(
          createNatError({
            kind: 'MemoryKeyService.SignTransaction.Args.InvalidSchema',
            context: { zodError: validArgs.error },
          }),
        );

      const { transaction: innerTransaction } = validArgs.data;

      const keyPair = context.safeFindKeyPair({
        publicKey: innerTransaction.signerPublicKey.publicKey,
      });

      // TODO Think if it's possible to wrap into some helper function
      if (!keyPair.ok) {
        if (keyPair.error.kind === 'MemoryKeyService.FindKeyPair.NotFound')
          return result.err(
            createNatError({
              kind: 'MemoryKeyService.SignTransaction.SigningKeyPair.NotFound',
              context: {
                signerPublicKey: innerTransaction.signerPublicKey.publicKey,
              },
            }),
          );
        throw keyPair.error;
      }

      const { transactionHash, u8TransactionHash } =
        getTransactionHash(innerTransaction);

      const { signature } = keyPair.value.sign(u8TransactionHash);

      return result.ok({
        transaction: args.transaction,
        transactionHash,
        signature,
      });
    },
  );
