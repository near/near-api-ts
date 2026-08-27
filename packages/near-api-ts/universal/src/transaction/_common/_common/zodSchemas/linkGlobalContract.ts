import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../../../_common/zodSchemas/accountId';

export const LinkGlobalContractActionZodSchema = z.object({
  actionType: z.literal('LinkGlobalContract'),
  globalContractAccountId: AccountIdZodSchema,
});

export type InnerLinkGlobalContractAction = z.infer<typeof LinkGlobalContractActionZodSchema>;
