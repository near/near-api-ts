import * as z from 'zod/mini';

export const CreateAccountActionSchema = z.object({
  actionType: z.literal('CreateAccount'),
});
