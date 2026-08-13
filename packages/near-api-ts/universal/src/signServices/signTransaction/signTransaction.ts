import * as z from 'zod/mini';
import type { SafeSignTransaction, SignTransaction } from '../../../types/_common/transaction/signTransaction';
import { asThrowable } from '../../_common/_common/asThrowable';
import { result, resultNatError } from '../../_common/_common/result';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { getTransactionHash } from './getTransactionHash';
import { getSignedTransactionBorsh } from './toBorshBytes/transaction';
import { TransactionZodSchema } from './zodSchemas/transaction';

const SignTransactionArgsSchema = z.object({
  transaction: TransactionZodSchema,
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

    // #1: Sign transaction
    const { transaction: innerTransaction } = validArgs.data;
    const { transactionHash, transactionHashU8 } = getTransactionHash(innerTransaction);

    const signedData = await args.signDataProvider.safeSignData({
      publicKey: innerTransaction.signerPublicKey.publicKey,
      dataU8: transactionHashU8,
    });

    if (!signedData.ok)
      return resultNatError('SignTransaction.SignData.Failed', { cause: signedData.error });

    // #2: Serialize signed transaction into Borsh -> Base64
    const signedTransactionBorsh64 = getSignedTransactionBorsh(
      innerTransaction,
      signedData.value,
    ).toBase64();

    // #3: Return signed transaction
    return result.ok({
      transactionHash,
      transaction: args.transaction,
      signature: signedData.value.signature,
      signedTransactionBorsh64,
    });
  },
);

export const signTransaction: SignTransaction = asThrowable(safeSignTransaction);
