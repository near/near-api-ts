import * as z from 'zod/mini';
import { PublicKeySchema } from '@common/schemas/zod/common/publicKey';
import { AccountIdSchema } from '@common/schemas/zod/common/accountId';
import { ContractFunctionNameSchema } from '@common/schemas/zod/common/common';
import { NearTokenArgsSchema } from '@common/schemas/zod/common/nearToken';

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
  gasBudget: NearTokenArgsSchema,
  allowedFunctions: z.optional(
    z.array(ContractFunctionNameSchema).check(z.minLength(1)),
  ),
});

export const AddKeyActionSchema = z.union([
  AddFullAccessKeyActionSchema,
  AddFunctionCallKeyActionSchema,
]);

export type InnerAddKeyAction = z.infer<typeof AddKeyActionSchema>;
