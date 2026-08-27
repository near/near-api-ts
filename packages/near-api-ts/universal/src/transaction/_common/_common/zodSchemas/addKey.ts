import * as z from 'zod/mini';
import { NearTokenArgsZodSchema } from '../../../../_common/_common/zodSchemas/nearToken';
import { AccountIdZodSchema } from '../../../../_common/zodSchemas/accountId';
import { ContractFunctionNameZodSchema } from '../../../../_common/zodSchemas/contractFunctionName';
import { PublicKeyZodSchema } from '../../../../_common/zodSchemas/publicKey';

export const GasBudgetZodSchema = z.union([z.literal('Unlimited'), NearTokenArgsZodSchema]);

export const AllowedFunctionsSchema = z.union([
  z.literal('AllNonPayable'),
  z.array(ContractFunctionNameZodSchema).check(z.minLength(1)),
]);

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
