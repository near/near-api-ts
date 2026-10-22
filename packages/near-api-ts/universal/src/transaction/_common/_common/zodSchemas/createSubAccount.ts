import * as z from 'zod/mini';

export const CreateSubAccountActionZodSchema = z.object({
  actionType: z.literal('CreateSubAccount'),
});
