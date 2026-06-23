import { ActionErrorSchema, MerklePathItemSchema } from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../common/accountId';
import { CryptoHashZodSchema } from '../../common/cryptoHash';

export const RpcReceiptOutcomeZodSchema = z.object({
  blockHash: CryptoHashZodSchema,
  id: CryptoHashZodSchema,
  outcome: z.object({
    status: z.union([
      z.object({ SuccessValue: z.base64() }),
      z.object({ SuccessReceiptId: CryptoHashZodSchema }),
      z.object({ Failure: z.object({ ActionError: ActionErrorSchema() }) }),
    ]),
    executorId: AccountIdZodSchema,
    receiptIds: z.array(CryptoHashZodSchema),
    gasBurnt: z.number(),
    tokensBurnt: z.string(),
    metadata: z.union([
      z.object({
        version: z.literal(1),
        gasProfile: z.null(),
      }),
      z.object({
        version: z.union([z.literal(2), z.literal(3)]),
        gasProfile: z.array(
          z.object({
            cost: z.string(),
            costCategory: z.union([z.literal('ACTION_COST'), z.literal('WASM_HOST_COST')]),
            gasUsed: z.string(),
          }),
        ),
      }),
    ]),
    logs: z.array(z.string()),
  }),
  proof: z.array(MerklePathItemSchema()),
});

export type RpcReceiptOutcome = z.infer<typeof RpcReceiptOutcomeZodSchema>;
