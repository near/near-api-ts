import * as z from 'zod/mini';
import { NearTokenArgsSchema } from '../../common/nearToken';

export const TransferActionSchema = z.object({
  actionType: z.literal('Transfer'),
  amount: NearTokenArgsSchema,
});

export type InnerTransferAction = z.infer<typeof TransferActionSchema>;
