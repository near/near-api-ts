import * as z from 'zod/mini';
import { AccountIdSchema } from '@common/schemas/zod/common/accountId';

export const DeleteAccountActionSchema = z.object({
  actionType: z.literal('DeleteAccount'),
  beneficiaryAccountId: AccountIdSchema,
});

export type InnerDeleteAccountAction = z.infer<
  typeof DeleteAccountActionSchema
>;
