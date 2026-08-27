import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../_common/zodSchemas/accountId';
import {
  MultiTransactionActionsZodSchema,
  SingleTransactionActionZodSchema,
} from '../../transaction/signTransaction/transactionZodSchema';

export const TransactionIntentZodSchema = z.union([
  z.object({
    receiverAccountId: AccountIdZodSchema,
    ...SingleTransactionActionZodSchema.shape,
  }),
  z.object({
    receiverAccountId: AccountIdZodSchema,
    ...MultiTransactionActionsZodSchema.shape,
  }),
]);
