import * as z from 'zod/mini';
import { AllowedFunctionsSchema, GasBudgetSchema } from '../../common/accessKey';
import { AccountIdSchema } from '../../common/accountId';
import { PublicKeySchema } from '../../common/publicKey';

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
