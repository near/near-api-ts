import * as z from 'zod/mini';
import {
  AllowedFunctionsSchema,
  GasBudgetZodSchema,
} from '../../../../../_common/zodSchemas/accessKey';
import { AccountIdZodSchema } from '../../../../../_common/zodSchemas/accountId';
import { PublicKeyZodSchema } from '../../../../../_common/zodSchemas/publicKey';

const AddFullAccessKeyActionZodSchema = z.object({
  actionType: z.literal('AddKey'),
  accessType: z.literal('FullAccess'),
  publicKey: PublicKeyZodSchema,
});

const AddFunctionCallKeyActionZodSchema = z.object({
  actionType: z.literal('AddKey'),
  accessType: z.literal('FunctionCall'),
  publicKey: PublicKeyZodSchema,
  contractAccountId: AccountIdZodSchema,
  gasBudget: GasBudgetZodSchema,
  allowedFunctions: AllowedFunctionsSchema,
});

export const AddKeyActionZodSchema = z.union([
  AddFullAccessKeyActionZodSchema,
  AddFunctionCallKeyActionZodSchema,
]);

export type InnerAddKeyAction = z.infer<typeof AddKeyActionZodSchema>;
