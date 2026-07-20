import { ActionErrorSchema, InvalidTxErrorSchema } from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import { RpcActionReceiptZodSchema } from './receipt';
import { RpcReceiptOutcomeZodSchema } from './receiptOutcome';
import {
  RpcTransactionOutcomeFailureZodSchema,
  RpcTransactionOutcomeSuccessZodSchema,
} from './transactionOutcome';
import { RpcTransactionSummaryZodSchema } from './transactionSummary';

// Transaction Processing Stages

// NONE
export const RpcNoneTransactionDetailsZodSchema = z.object({
  finalExecutionStatus: z.literal('NONE'),
  status: z.optional(z.never()),
  transaction: z.optional(z.never()),
  transactionOutcome: z.optional(z.never()),
  receipts: z.optional(z.never()),
  receiptsOutcome: z.optional(z.never()),
});

export type RpcNoneTransactionDetails = z.infer<typeof RpcNoneTransactionDetailsZodSchema>;

// INCLUDED

export const RpcIncludedTransactionDetailsZodSchema = z.union([
  z.object({
    finalExecutionStatus: z.literal('INCLUDED'),
    status: z.optional(z.never()),
    transaction: z.optional(z.never()),
    transactionOutcome: z.optional(z.never()),
    receipts: z.optional(z.never()),
    receiptsOutcome: z.optional(z.never()),
  }),
  z.object({
    finalExecutionStatus: z.literal('INCLUDED'),
    status: z.literal('Started'),
    transaction: RpcTransactionSummaryZodSchema,
    transactionOutcome: RpcTransactionOutcomeSuccessZodSchema,
    receipts: z.array(RpcActionReceiptZodSchema), // length: 0 -> n
    receiptsOutcome: z.array(RpcReceiptOutcomeZodSchema), // length: 0 -> n
  }),
]);

export type RpcIncludedTransactionDetails = z.infer<typeof RpcIncludedTransactionDetailsZodSchema>;

// INCLUDED_FINAL
export const RpcIncludedFinalTransactionDetailsZodSchema = z.object({
  finalExecutionStatus: z.literal('INCLUDED_FINAL'),
  status: z.literal('Started'),
  transaction: RpcTransactionSummaryZodSchema,
  transactionOutcome: RpcTransactionOutcomeSuccessZodSchema,
  receipts: z.array(RpcActionReceiptZodSchema), // length: 0 -> n
  receiptsOutcome: z.array(RpcReceiptOutcomeZodSchema), // length: 0 -> n
});

export type RpcIncludedFinalTransactionDetails = z.infer<
  typeof RpcIncludedFinalTransactionDetailsZodSchema
>;

// EXECUTED_OPTIMISTIC
export const RpcExecutedOptimisticTransactionDetailsZodSchema = z.union([
  z.object({
    finalExecutionStatus: z.literal('EXECUTED_OPTIMISTIC'),
    status: z.union([
      z.object({ SuccessValue: z.base64() }),
      z.object({ Failure: z.object({ ActionError: ActionErrorSchema() }) }),
    ]),
    transaction: RpcTransactionSummaryZodSchema,
    transactionOutcome: RpcTransactionOutcomeSuccessZodSchema,
    receipts: z.array(RpcActionReceiptZodSchema), // length: 0 -> n
    receiptsOutcome: z.array(RpcReceiptOutcomeZodSchema), // length: 1 -> n
  }),
  z.object({
    finalExecutionStatus: z.literal('EXECUTED_OPTIMISTIC'),
    status: z.object({
      Failure: z.object({ InvalidTxError: InvalidTxErrorSchema() }),
    }),
    transaction: RpcTransactionSummaryZodSchema,
    transactionOutcome: RpcTransactionOutcomeFailureZodSchema,
    receipts: z.tuple([]), // length: 0
    receiptsOutcome: z.tuple([]), // length: 0
  }),
]);

export type RpcExecutedOptimisticTransactionDetails = z.infer<
  typeof RpcExecutedOptimisticTransactionDetailsZodSchema
>;

// EXECUTED
export const RpcExecutedTransactionDetailsZodSchema = z.object({
  finalExecutionStatus: z.literal('EXECUTED'),
  status: z.union([
    z.object({ SuccessValue: z.base64() }),
    z.object({ Failure: z.object({ ActionError: ActionErrorSchema() }) }),
  ]),
  transaction: RpcTransactionSummaryZodSchema,
  transactionOutcome: RpcTransactionOutcomeSuccessZodSchema,
  receipts: z.array(RpcActionReceiptZodSchema), // length: 0 -> n
  receiptsOutcome: z.array(RpcReceiptOutcomeZodSchema), // length: 1 -> n
});

export type RpcExecutedTransactionDetails = z.infer<typeof RpcExecutedTransactionDetailsZodSchema>;

// FINAL
export const RpcFinalTransactionDetailsZodSchema = z.union([
  z.object({
    finalExecutionStatus: z.literal('FINAL'),
    status: z.union([
      z.object({ SuccessValue: z.base64() }),
      z.object({ Failure: z.object({ ActionError: ActionErrorSchema() }) }),
    ]),
    transaction: RpcTransactionSummaryZodSchema,
    transactionOutcome: RpcTransactionOutcomeSuccessZodSchema,
    receipts: z.array(RpcActionReceiptZodSchema), // length: 0 -> n
    receiptsOutcome: z.array(RpcReceiptOutcomeZodSchema), // length: 1 -> n
  }),
  z.object({
    finalExecutionStatus: z.literal('FINAL'),
    status: z.object({
      Failure: z.object({ InvalidTxError: InvalidTxErrorSchema() }),
    }),
    transaction: RpcTransactionSummaryZodSchema,
    transactionOutcome: RpcTransactionOutcomeFailureZodSchema,
    receipts: z.tuple([]), // length: 0
    receiptsOutcome: z.tuple([]), // length: 0
  }),
]);

export type RpcFinalTransactionDetails = z.infer<typeof RpcFinalTransactionDetailsZodSchema>;

// Union of all observable (non-NONE) `finalExecutionStatus` discriminants. `NONE` is excluded
// because it never reaches the transaction-details handlers (see `RpcResult`).
export type RpcFinalExecutionStatus =
  | 'INCLUDED'
  | 'INCLUDED_FINAL'
  | 'EXECUTED_OPTIMISTIC'
  | 'EXECUTED'
  | 'FINAL';
