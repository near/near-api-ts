import * as z from 'zod/mini';
import { PublicKeySchema } from '@common/schemas/zod/common/publicKey';

export const DeleteKeyActionSchema = z.object({
  actionType: z.literal('DeleteKey'),
  publicKey: PublicKeySchema,
});

export type InnerDeleteKeyAction = z.infer<typeof DeleteKeyActionSchema>;
