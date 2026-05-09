import * as z from 'zod/mini';
import { NearTokenArgsZodSchema } from '../../common/nearToken';

export const TransferActionZodSchema = z.object({
  actionType: z.literal('Transfer'),
  amount: NearTokenArgsZodSchema,
});

export type InnerTransferAction = z.infer<typeof TransferActionZodSchema>;
