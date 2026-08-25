import { sha256 } from '@noble/hashes/sha2.js';
import { base58 } from '@scure/base';
import { serialize } from 'borsh';
import * as z from 'zod/mini';
import type {
  SafeSignTransaction,
  SignTransaction,
} from '../../../types/_common/transaction/signTransaction';
import type { NearcoreSignedTransaction } from '../../../types/_common/transaction/transaction';
import { result, resultNatError } from '../../_common/_common/_common/result';
import { asThrowable } from '../../_common/_common/asThrowable';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { toNearcoreSignature } from '../_common/toNearcore/toNearcoreSignature';
import {
  SignedTransactionBorshSchema,
  TransactionBorshSchema,
} from './borshSchemas/transaction/transaction';
import { toNearcoreTransaction } from './toNearcoreTransaction/toNearcoreTransaction';
import { TransactionZodSchema } from './zodSchemas/transaction/transaction';

const SignTransactionArgsSchema = z.object({
  transaction: TransactionZodSchema,
  signDataProvider: z.object({
    safeSignData: z.custom(
      (val) => typeof val === 'function',
      'signDataProvider.safeSignData must be a function',
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

    const nearcoreTransaction = toNearcoreTransaction(innerTransaction);
    const transactionBorshU8 = serialize(TransactionBorshSchema, nearcoreTransaction);
    const transactionHashU8 = sha256(transactionBorshU8);

    const signedData = await args.signDataProvider.safeSignData({
      publicKey: innerTransaction.signerPublicKey.publicKey,
      dataU8: transactionHashU8,
    });

    if (!signedData.ok)
      return resultNatError('SignTransaction.SignData.Failed', { cause: signedData.error });

    // #2: Serialize signed transaction into borsh
    const nearcoreSignedTransaction: NearcoreSignedTransaction = {
      transaction: nearcoreTransaction,
      signature: toNearcoreSignature(signedData.value),
    };

    const signedTransactionBorshU8 = serialize(
      SignedTransactionBorshSchema,
      nearcoreSignedTransaction,
    );

    // #3: Return signed transaction. The single-action shorthand is normalized into
    // the action list, so the signed value always has the shape the bytes encode.
    const { action, actions, ...transactionBase } = args.transaction;

    return result.ok({
      transactionHash: base58.encode(transactionHashU8),
      signedTransaction: {
        transaction: { ...transactionBase, actions: action ? [action] : actions },
        signature: signedData.value.signature,
      },
      signedTransactionBorsh64: signedTransactionBorshU8.toBase64(),
    });
  },
);

export const signTransaction: SignTransaction = asThrowable(safeSignTransaction);
