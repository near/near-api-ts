import * as z from 'zod/mini';
import { AccountIdSchema } from '@common/schemas/zod/common/accountId';

export const TransactionSchema = z.object({
  signerAccountId: AccountIdSchema,
  receiverAccountId: AccountIdSchema,
});
