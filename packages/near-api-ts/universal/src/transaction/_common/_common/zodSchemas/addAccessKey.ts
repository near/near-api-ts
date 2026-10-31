import * as z from 'zod/mini';
import { constants } from '../../../../_common/_common/_common/constants';
import { NearTokenArgsZodSchema } from '../../../../_common/_common/zodSchemas/nearToken';
import { AccountIdZodSchema } from '../../../../_common/zodSchemas/accountId';
import { ContractFunctionNameZodSchema } from '../../../../_common/zodSchemas/contractFunctionName';
import { PublicKeyZodSchema } from '../../../../_common/zodSchemas/publicKey';

export const AllowedFunctionsZodSchema = z.union([
  z.literal('AllNonPayable'),
  z.array(ContractFunctionNameZodSchema).check(z.minLength(1)),
]);

const FullAccessPermissionZodSchema = z.object({
  kind: z.literal('FullAccess'),
});

const ContractFunctionCallPermissionZodSchema = z.object({
  kind: z.literal('ContractFunctionCall'),
  allowedContract: AccountIdZodSchema,
  allowedFunctions: AllowedFunctionsZodSchema,
});

const ContractFunctionCallAccountBalanceGasPaymentZodSchema = z.object({
  source: z.literal('AccountBalance'),
  allowance: z.union([z.literal('Unlimited'), NearTokenArgsZodSchema]),
});

const KeyBalanceGasPaymentZodSchema = z.object({
  source: z.literal('KeyBalance'),
  allowance: z.optional(z.never()),
});

const ChannelCountZodSchema = z
  .number()
  .check(z.int(), z.gte(1), z.lte(constants.NonceChannels.MaxChannelCount));

// ── Arguments of addAccessKey ────────────────────────────────

const AccountBalanceFullAccessKeyArgsZodSchema = z.object({
  publicKey: PublicKeyZodSchema,
  permission: FullAccessPermissionZodSchema,
  gasPayment: z.object({
    source: z.literal('AccountBalance'),
    allowance: z.optional(z.never()),
  }),
  replayProtection: z.optional(z.never()),
});

const AccountBalanceContractFunctionCallKeyArgsZodSchema = z.object({
  publicKey: PublicKeyZodSchema,
  permission: ContractFunctionCallPermissionZodSchema,
  gasPayment: ContractFunctionCallAccountBalanceGasPaymentZodSchema,
  replayProtection: z.optional(z.never()),
});

const NonceChannelsArgsZodSchema = z.object({
  channelCount: ChannelCountZodSchema,
});

const KeyBalanceFullAccessKeyArgsZodSchema = z.object({
  publicKey: PublicKeyZodSchema,
  permission: FullAccessPermissionZodSchema,
  gasPayment: KeyBalanceGasPaymentZodSchema,
  replayProtection: NonceChannelsArgsZodSchema,
});

const KeyBalanceContractFunctionCallKeyArgsZodSchema = z.object({
  publicKey: PublicKeyZodSchema,
  permission: ContractFunctionCallPermissionZodSchema,
  gasPayment: KeyBalanceGasPaymentZodSchema,
  replayProtection: NonceChannelsArgsZodSchema,
});

export const AddAccessKeyArgsZodSchema = z.union([
  AccountBalanceFullAccessKeyArgsZodSchema,
  AccountBalanceContractFunctionCallKeyArgsZodSchema,
  KeyBalanceFullAccessKeyArgsZodSchema,
  KeyBalanceContractFunctionCallKeyArgsZodSchema,
]);

// ── The action ───────────────────────────────────────────────
// It spells out what the arguments leave implied: the allowance of a full access key and the
// replay protection scheme of every key.

const ActionTypeShape = { actionType: z.literal('AddAccessKey') };

const NonceChannelZodSchema = z.object({
  scheme: z.literal('NonceChannel'),
  channelCount: z.optional(z.never()),
});

const NonceChannelsZodSchema = z.object({
  scheme: z.literal('NonceChannels'),
  channelCount: ChannelCountZodSchema,
});

export const AddAccessKeyActionZodSchema = z.union([
  z.object({
    ...ActionTypeShape,
    publicKey: PublicKeyZodSchema,
    permission: FullAccessPermissionZodSchema,
    gasPayment: z.object({
      source: z.literal('AccountBalance'),
      allowance: z.literal('Unlimited'),
    }),
    replayProtection: NonceChannelZodSchema,
  }),
  z.object({
    ...ActionTypeShape,
    publicKey: PublicKeyZodSchema,
    permission: ContractFunctionCallPermissionZodSchema,
    gasPayment: ContractFunctionCallAccountBalanceGasPaymentZodSchema,
    replayProtection: NonceChannelZodSchema,
  }),
  z.object({
    ...ActionTypeShape,
    publicKey: PublicKeyZodSchema,
    permission: FullAccessPermissionZodSchema,
    gasPayment: KeyBalanceGasPaymentZodSchema,
    replayProtection: NonceChannelsZodSchema,
  }),
  z.object({
    ...ActionTypeShape,
    publicKey: PublicKeyZodSchema,
    permission: ContractFunctionCallPermissionZodSchema,
    gasPayment: KeyBalanceGasPaymentZodSchema,
    replayProtection: NonceChannelsZodSchema,
  }),
]);

export type InnerAddAccessKeyAction = z.infer<typeof AddAccessKeyActionZodSchema>;
