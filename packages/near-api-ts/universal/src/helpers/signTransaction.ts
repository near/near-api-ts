import * as z from 'zod/mini';
import type { SafeSignTransaction, SignTransaction } from '../../types/helpers/signTransaction';
import { resultNatError } from '../_common/natError';
import { TransactionSchema } from '../_common/schemas/zod/transaction/transaction';
import { asThrowable } from '../_common/utils/asThrowable';
import { getTransactionHash } from '../_common/utils/getTransactionHash';
import { result } from '../_common/utils/result';
import { wrapInternalError } from '../_common/utils/wrapInternalError';

const SignTransactionArgsSchema = z.object({
  transaction: TransactionSchema,
  signDataProvider: z.object({
    safeSignData: z.custom(
      (val) => typeof val === 'function',
      'keyService.safeSignData must be a function',
    ),
  }),
});

export const safeSignTransaction: SafeSignTransaction = wrapInternalError(
  'SignTransaction.Internal',
  async (args) => {
    const validArgs = SignTransactionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('SignTransaction.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const { transaction: innerTransaction } = validArgs.data;

    const { transactionHash, u8TransactionHash } = getTransactionHash(innerTransaction);

    const signedData = await args.signDataProvider.safeSignData({
      publicKey: innerTransaction.signerPublicKey.publicKey,
      dataU8: u8TransactionHash,
    });

    if (!signedData.ok) return result.err(signedData.error);

    return result.ok({
      transaction: args.transaction,
      transactionHash,
      signature: signedData.value.signature,
    });
  },
);

export const signTransaction: SignTransaction = asThrowable(safeSignTransaction);
