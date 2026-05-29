import { InvalidTxErrorSchema, MerklePathItemSchema } from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../common/accountId';
import { CryptoHashZodSchema } from '../../common/cryptoHash';

export const RpcTransactionOutcomeCommonZodSchema = z.object({
  blockHash: CryptoHashZodSchema,
  id: CryptoHashZodSchema, // transaction hash
  outcome: z.object({
    executorId: AccountIdZodSchema,
    gasBurnt: z.number(),
    tokensBurnt: z.string(),
    logs: z.tuple([]), // useless, always empty
    // useless, always empty
    metadata: z.object({
      version: z.literal(1),
      gasProfile: z.null(),
    }),
  }),
  proof: z.array(MerklePathItemSchema()), // We don't use it
});

export const RpcTransactionOutcomeSuccessZodSchema = z.object({
  ...RpcTransactionOutcomeCommonZodSchema.shape,
  outcome: z.object({
    ...RpcTransactionOutcomeCommonZodSchema.shape.outcome.shape,
    receiptIds: z.tuple([CryptoHashZodSchema]), // equal to status.SuccessReceiptId
    status: z.object({ SuccessReceiptId: CryptoHashZodSchema }),
  }),
});

export type RpcTransactionOutcomeSuccess = z.infer<typeof RpcTransactionOutcomeSuccessZodSchema>;

export const RpcTransactionOutcomeFailureZodSchema = z.object({
  ...RpcTransactionOutcomeCommonZodSchema.shape,
  outcome: z.object({
    ...RpcTransactionOutcomeCommonZodSchema.shape.outcome.shape,
    receiptIds: z.tuple([]), // useless, always empty
    status: z.object({ Failure: z.object({ InvalidTxError: InvalidTxErrorSchema() }) }),
  }),
});

export type RpcTransactionOutcomeFailure = z.infer<typeof RpcTransactionOutcomeFailureZodSchema>;

export type RpcTransactionOutcome =
  | z.infer<typeof RpcTransactionOutcomeSuccessZodSchema>
  | z.infer<typeof RpcTransactionOutcomeFailureZodSchema>;

export const isRpcTransactionOutcomeSuccess = (
  o: RpcTransactionOutcome,
): o is RpcTransactionOutcomeSuccess => 'SuccessReceiptId' in o.outcome.status;

export const isRpcTransactionOutcomeFailure = (
  o: RpcTransactionOutcome,
): o is RpcTransactionOutcomeFailure => 'Failure' in o.outcome.status;
