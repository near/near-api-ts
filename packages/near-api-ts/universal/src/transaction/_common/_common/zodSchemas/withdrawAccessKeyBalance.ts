import * as z from 'zod/mini';
import { NearTokenArgsZodSchema } from '../../../../_common/_common/zodSchemas/nearToken';
import { PublicKeyZodSchema } from '../../../../_common/zodSchemas/publicKey';

export const WithdrawAccessKeyBalanceActionZodSchema = z.object({
  actionType: z.literal('WithdrawAccessKeyBalance'),
  publicKey: PublicKeyZodSchema,
  amount: NearTokenArgsZodSchema,
});

export type InnerWithdrawAccessKeyBalanceAction = z.infer<
  typeof WithdrawAccessKeyBalanceActionZodSchema
>;
