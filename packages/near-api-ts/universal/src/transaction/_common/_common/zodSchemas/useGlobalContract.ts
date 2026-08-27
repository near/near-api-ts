import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../../../_common/zodSchemas/accountId';
import { CryptoHashZodSchema } from '../../../../_common/zodSchemas/cryptoHash';

export const UseGlobalContractActionZodSchema = z.union([
  z.object({
    actionType: z.literal('UseGlobalContract'),
    wasmHash: CryptoHashZodSchema,
    ownerAccountId: z.optional(z.never()),
  }),
  z.object({
    actionType: z.literal('UseGlobalContract'),
    wasmHash: z.optional(z.never()),
    ownerAccountId: AccountIdZodSchema,
  }),
]);

export type InnerUseGlobalContractAction = z.infer<typeof UseGlobalContractActionZodSchema>;
