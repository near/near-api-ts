import * as z from 'zod/mini';
import { constants } from '../../../../_common/_common/_common/constants';
import { NearTokenArgsZodSchema } from '../../../../_common/_common/zodSchemas/nearToken';
import { AccountIdZodSchema } from '../../../../_common/zodSchemas/accountId';
import { ContractFunctionNameZodSchema } from '../../../../_common/zodSchemas/contractFunctionName';
import { PublicKeyZodSchema } from '../../../../_common/zodSchemas/publicKey';

export const AllowedFunctionsSchema = z.union([
  z.literal('AllNonPayable'),
  z.array(ContractFunctionNameZodSchema).check(z.minLength(1)),
]);

const FullAccessPermissionZodSchema = z.object({
  kind: z.literal('FullAccess'),
});

const FunctionCallPermissionZodSchema = z.object({
  kind: z.literal('FunctionCall'),
  allowedContract: AccountIdZodSchema,
  allowedFunctions: AllowedFunctionsSchema,
});

const NonceChannelsZodSchema = z.object({
  channelCount: z.number().check(z.int(), z.gte(1), z.lte(constants.NonceChannels.MaxChannelCount)),
});

const KeyBalanceGasPaymentZodSchema = z.object({
  source: z.literal('KeyBalance'),
  allowance: z.optional(z.never()),
});

const AccountBalanceFullAccessKeyShape = {
  publicKey: PublicKeyZodSchema,
  permission: FullAccessPermissionZodSchema,
  gasPayment: z.object({
    source: z.literal('AccountBalance'),
    allowance: z.optional(z.never()),
  }),
  replayProtection: z.optional(z.never()),
};

const AccountBalanceFunctionCallKeyShape = {
  publicKey: PublicKeyZodSchema,
  permission: FunctionCallPermissionZodSchema,
  gasPayment: z.object({
    source: z.literal('AccountBalance'),
    allowance: z.union([z.literal('Unlimited'), NearTokenArgsZodSchema]),
  }),
  replayProtection: z.optional(z.never()),
};

const KeyBalanceFullAccessKeyShape = {
  publicKey: PublicKeyZodSchema,
  permission: FullAccessPermissionZodSchema,
  gasPayment: KeyBalanceGasPaymentZodSchema,
  replayProtection: NonceChannelsZodSchema,
};

const KeyBalanceFunctionCallKeyShape = {
  publicKey: PublicKeyZodSchema,
  permission: FunctionCallPermissionZodSchema,
  gasPayment: KeyBalanceGasPaymentZodSchema,
  replayProtection: NonceChannelsZodSchema,
};

export const AddAccessKeyArgsZodSchema = z.union([
  z.object(AccountBalanceFullAccessKeyShape),
  z.object(AccountBalanceFunctionCallKeyShape),
  z.object(KeyBalanceFullAccessKeyShape),
  z.object(KeyBalanceFunctionCallKeyShape),
]);

const ActionTypeShape = { actionType: z.literal('AddAccessKey') };

export const AddAccessKeyActionZodSchema = z.union([
  z.object({ ...ActionTypeShape, ...AccountBalanceFullAccessKeyShape }),
  z.object({ ...ActionTypeShape, ...AccountBalanceFunctionCallKeyShape }),
  z.object({ ...ActionTypeShape, ...KeyBalanceFullAccessKeyShape }),
  z.object({ ...ActionTypeShape, ...KeyBalanceFunctionCallKeyShape }),
]);

export type InnerAddAccessKeyAction = z.infer<typeof AddAccessKeyActionZodSchema>;
