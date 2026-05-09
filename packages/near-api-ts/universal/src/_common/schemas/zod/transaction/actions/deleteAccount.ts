import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../common/accountId';

export const DeleteAccountActionZodSchema = z.object({
  actionType: z.literal('DeleteAccount'),
  beneficiaryAccountId: AccountIdZodSchema,
});

export type InnerDeleteAccountAction = z.infer<typeof DeleteAccountActionZodSchema>;
