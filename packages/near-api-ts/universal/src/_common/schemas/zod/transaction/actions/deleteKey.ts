import * as z from 'zod/mini';
import { PublicKeyZodSchema } from '../../common/publicKey';

export const DeleteKeyActionZodSchema = z.object({
  actionType: z.literal('DeleteKey'),
  publicKey: PublicKeyZodSchema,
});

export type InnerDeleteKeyAction = z.infer<typeof DeleteKeyActionZodSchema>;
