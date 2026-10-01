import * as z from 'zod/mini';
import { NearTokenArgsZodSchema } from '../../../../_common/_common/zodSchemas/nearToken';
import { PublicKeyZodSchema } from '../../../../_common/zodSchemas/publicKey';

export const TopUpAccessKeyBalanceActionZodSchema = z.object({
  actionType: z.literal('TopUpAccessKeyBalance'),
  publicKey: PublicKeyZodSchema,
  amount: NearTokenArgsZodSchema,
});

export type InnerTopUpAccessKeyBalanceAction = z.infer<typeof TopUpAccessKeyBalanceActionZodSchema>;
