import * as z from 'zod/mini';

export const CreateAccountActionZodSchema = z.object({
  actionType: z.literal('CreateAccount'),
});
