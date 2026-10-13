import * as z from 'zod/mini';
import { PublicKeyZodSchema } from '../../../../_common/zodSchemas/publicKey';

export const DeleteAccessKeyActionZodSchema = z.object({
  actionType: z.literal('DeleteAccessKey'),
  publicKey: PublicKeyZodSchema,
});

export type InnerDeleteAccessKeyAction = z.infer<typeof DeleteAccessKeyActionZodSchema>;
