// import * as z from 'zod/mini';
// import type { SafeSignDelegation, SignDelegation } from '../../types/_common/transaction/signDelegation';
// import { asThrowable } from './_common/utils/asThrowable';
// import { getTransactionHash } from './_common/utils/getTransactionHash';
// import { result } from './_common/utils/result';
// import { wrapInternalError } from './_common/utils/wrapInternalError';
// import { resultNatError } from './natError';
// import { TransactionZodSchema } from './schemas/zod/transaction/transaction';
// import { getSignedTransactionBorsh } from './transformers/toBorshBytes/transaction';
//
// const SignTransactionArgsSchema = z.object({
//   transaction: TransactionZodSchema,
//   signDataProvider: z.object({
//     safeSignData: z.custom(
//       (val) => typeof val === 'function',
//       'keyService.safeSignData must be a function',
//     ),
//   }),
// });
//
// export const safeSignDelegation: SafeSignDelegation = wrapInternalError(
//   'SignDelegation.Internal',
//   async (args) => {
//     const validArgs = SignTransactionArgsSchema.safeParse(args);
//
//     if (!validArgs.success)
//       return resultNatError('SignDelegation.Args.InvalidSchema', {
//         zodError: validArgs.error,
//       });
//
//     // #1: Sign transaction
//     const { transaction: innerTransaction } = validArgs.data;
//     const { transactionHash, transactionHashU8 } = getTransactionHash(innerTransaction);
//
//     const signedData = await args.signDataProvider.safeSignData({
//       publicKey: innerTransaction.signerPublicKey.publicKey,
//       dataU8: transactionHashU8,
//     });
//     if (!signedData.ok) return result.err(signedData.error);
//
//     // #2: Serialize signed transaction into Borsh -> Base64
//     const signedTransactionBorsh64 = getSignedTransactionBorsh(
//       innerTransaction,
//       signedData.value,
//     ).toBase64();
//
//     // #3: Return signed transaction
//     return result.ok({
//       transactionHash,
//       transaction: args.transaction,
//       signature: signedData.value.signature,
//       signedTransactionBorsh64,
//     });
//   },
// );
//
// export const signDelegation: SignDelegation = asThrowable(safeSignDelegation);
