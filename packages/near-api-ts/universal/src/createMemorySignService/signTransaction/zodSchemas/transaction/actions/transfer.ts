import * as z from 'zod/mini';
import { NearTokenArgsZodSchema } from '../../../../../_common/_common/zodSchemas/nearToken';

export const TransferActionZodSchema = z.object({
  actionType: z.literal('Transfer'),
  amount: NearTokenArgsZodSchema,
});

export type InnerTransferAction = z.infer<typeof TransferActionZodSchema>;
