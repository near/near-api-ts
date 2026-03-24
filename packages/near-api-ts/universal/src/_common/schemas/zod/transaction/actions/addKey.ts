import * as z from 'zod/mini';
import { AccountIdSchema } from '../../common/accountId';
import { PublicKeySchema } from '../../common/publicKey';
import { GasBudgetSchema, AllowedFunctionsSchema } from '../../common/accessKey';

const AddFullAccessKeyActionSchema = z.object({
  actionType: z.literal('AddKey'),
  accessType: z.literal('FullAccess'),
  publicKey: PublicKeySchema,
});

const AddFunctionCallKeyActionSchema = z.object({
  actionType: z.literal('AddKey'),
  accessType: z.literal('FunctionCall'),
  publicKey: PublicKeySchema,
  contractAccountId: AccountIdSchema,
  gasBudget: GasBudgetSchema,
  allowedFunctions: AllowedFunctionsSchema,
});

export const AddKeyActionSchema = z.union([
  AddFullAccessKeyActionSchema,
  AddFunctionCallKeyActionSchema,
]);

export type InnerAddKeyAction = z.infer<typeof AddKeyActionSchema>;
