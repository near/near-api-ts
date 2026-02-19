import { createNatError } from '@universal/src/_common/natError';
import { TransactionSchema } from '@universal/src/_common/schemas/zod/transaction/transaction';
import { getTransactionHash } from '@universal/src/_common/utils/getTransactionHash';
import { result } from '@universal/src/_common/utils/result';
import { wrapInternalError } from '@universal/src/_common/utils/wrapInternalError';
import * as z from 'zod/mini';
import type { IdbKeyServiceContext } from '../idbKeyService';

const SignTransactionArgsSchema = z.object({
  transaction: TransactionSchema,
});

export const createSafeSignTransaction: any = (context: IdbKeyServiceContext) =>
  wrapInternalError(
    `IdbKeyService.SignTransaction.Internal`,
    async (args: any) => {
      const validArgs = SignTransactionArgsSchema.safeParse(args);

      if (!validArgs.success)
        return result.err(
          createNatError({
            kind: `IdbKeyService.SignTransaction.Args.InvalidSchema`,
            context: { zodError: validArgs.error },
          }),
        );

      const { transaction: innerTransaction } = validArgs.data;

      const keyPair = await context.getKeyPair(
        innerTransaction.signerPublicKey.publicKey,
      );

      // TODO Think if it's possible to wrap into some helper function
      if (!keyPair.ok) {
        // if (keyPair.error.kind === 'MemoryKeyService.FindKeyPair.NotFound')
        //   return result.err(
        //     createNatError({
        //       kind: 'MemoryKeyService.SignTransaction.SigningKeyPair.NotFound',
        //       context: {
        //         signerPublicKey: innerTransaction.signerPublicKey.publicKey,
        //       },
        //     }),
        //   );
        console.log(keyPair);
        throw keyPair.error;
      }

      const { transactionHash, u8TransactionHash } =
        getTransactionHash(innerTransaction);

      const { signature } = keyPair.value.sign(u8TransactionHash); // todo make async?

      return result.ok({
        transaction: args.transaction,
        transactionHash,
        signature,
      });
    },
  );
