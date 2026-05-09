import {
  ExecutionOutcomeWithIdViewSchema,
  FinalExecutionStatusSchema,
  ReceiptViewSchema,
  SignedTransactionViewSchema,
} from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import { TransactionNonceZodSchema } from '../../common/common';
import { CryptoHashZodSchema } from '../../common/cryptoHash';

const FinalExecutionStatusZodSchema = z.literal([
  'NONE',
  'INCLUDED',
  'EXECUTED_OPTIMISTIC',
  'INCLUDED_FINAL',
  'EXECUTED',
  'FINAL',
]);

const SignedTransactionViewZodSchema = z.object({
  // actions: z.array(z.lazy(() => ActionViewSchema())),
  hash: CryptoHashZodSchema,
  nonce: TransactionNonceZodSchema,
  // priorityFee: z.optional(z.number()),
  // publicKey: z.lazy(() => PublicKeyZodSchema()),
  // receiverId: z.lazy(() => AccountIdZodSchema()),
  // signature: z.lazy(() => SignatureZodSchema()),
  // signerId: z.lazy(() => AccountIdZodSchema()),
});

const TransactionStatusRpcResultZodSchema = z.object({
  finalExecutionStatus: FinalExecutionStatusZodSchema,
  status: FinalExecutionStatusSchema(),
  transaction: SignedTransactionViewSchema(),
  transactionOutcome: ExecutionOutcomeWithIdViewSchema(),
  receipts: z.array(ReceiptViewSchema()),
  receiptsOutcome: z.array(ExecutionOutcomeWithIdViewSchema()),
});

// type TransactionStatusRpcResult = z.infer<typeof TransactionStatusRpcResultZodSchema>;
