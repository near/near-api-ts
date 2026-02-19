import * as z from 'zod/mini';
import { AccountIdSchema } from '../../common/accountId';
import { ContractFunctionNameSchema } from '../../common/common';
import { NearTokenArgsSchema } from '../../common/nearToken';
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
  gasBudget: z.optional(NearTokenArgsSchema),
  allowedFunctions: z.optional(
    z.array(ContractFunctionNameSchema).check(z.minLength(1)),
  ),
});

export const AddKeyActionSchema = z.union([
  AddFullAccessKeyActionSchema,
  AddFunctionCallKeyActionSchema,
]);

export type InnerAddKeyAction = z.infer<typeof AddKeyActionSchema>;
