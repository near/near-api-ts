import { sha256 } from '@noble/hashes/sha2.js';
import { base58 } from '@scure/base';
import { serialize } from 'borsh';
import * as z from 'zod/mini';
import type {
  SafeSignTransaction,
  SignTransaction,
} from '../../../types/_common/transaction/signTransaction';
import type { NativeSignedTransaction } from '../../../types/_common/transaction/transaction';
import { asThrowable } from '../../_common/_common/asThrowable';
import { result, resultNatError } from '../../_common/_common/result';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { SignedTransactionBorshSchema, TransactionBorshSchema } from './borsh/transaction';
import { toNativeSignature } from './toNative/signature';
import { toNativeTransaction } from './toNative/transaction';
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

    const nativeTransaction = toNativeTransaction(innerTransaction);
    const transactionBorshU8 = serialize(TransactionBorshSchema, nativeTransaction);
    const transactionHashU8 = sha256(transactionBorshU8);

    const signedData = await args.signDataProvider.safeSignData({
      publicKey: innerTransaction.signerPublicKey.publicKey,
      dataU8: transactionHashU8,
    });

    if (!signedData.ok)
      return resultNatError('SignTransaction.SignData.Failed', { cause: signedData.error });

    // #2: Serialize signed transaction into borsh
    const nativeSignedTransaction: NativeSignedTransaction = {
      transaction: nativeTransaction,
      signature: toNativeSignature(signedData.value),
    };

    const signedTransactionBorshU8 = serialize(
      SignedTransactionBorshSchema,
      nativeSignedTransaction,
    );

    // #3: Return signed transaction
    return result.ok({
      transactionHash: base58.encode(transactionHashU8),
      transaction: args.transaction,
      signature: signedData.value.signature,
      signedTransactionBorsh64: signedTransactionBorshU8.toBase64(),
    });
  },
);

export const signTransaction: SignTransaction = asThrowable(safeSignTransaction);
