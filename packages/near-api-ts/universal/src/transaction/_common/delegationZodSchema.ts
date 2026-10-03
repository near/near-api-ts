import * as z from 'zod/mini';
import { constants } from '../../_common/_common/_common/constants';
import { AccountIdZodSchema } from '../../_common/zodSchemas/accountId';
import { BlockHeightZodSchema } from '../../_common/zodSchemas/blockHeight';
import { PublicKeyZodSchema } from '../../_common/zodSchemas/publicKey';
import { SignatureZodSchema } from '../../_common/zodSchemas/signature';
import { TransactionNonceZodSchema } from '../../_common/zodSchemas/transactionNonce';
import { AddAccessKeyActionZodSchema } from './_common/zodSchemas/addAccessKey';
import { CreateAccountActionZodSchema } from './_common/zodSchemas/createAccount';
import { DeleteAccountActionZodSchema } from './_common/zodSchemas/deleteAccount';
import { DeleteKeyActionZodSchema } from './_common/zodSchemas/deleteKey';
import { DeployContractActionZodSchema } from './_common/zodSchemas/deployContract';
import { FunctionCallActionZodSchema } from './_common/zodSchemas/functionCall';
import { LinkGlobalContractActionZodSchema } from './_common/zodSchemas/linkGlobalContract';
import { NonceChannelIdZodSchema } from './_common/zodSchemas/nonceChannelId';
import { PinGlobalContractActionZodSchema } from './_common/zodSchemas/pinGlobalContract';
import { RegisterLinkableGlobalContractActionZodSchema } from './_common/zodSchemas/registerLinkableGlobalContract';
import { RegisterPinnableGlobalContractActionZodSchema } from './_common/zodSchemas/registerPinnableGlobalContract';
import { StakeActionZodSchema } from './_common/zodSchemas/stake';
import { TopUpAccessKeyBalanceActionZodSchema } from './_common/zodSchemas/topUpAccessKeyBalance';
import { TransferActionZodSchema } from './_common/zodSchemas/transfer';
import { WithdrawAccessKeyBalanceActionZodSchema } from './_common/zodSchemas/withdrawAccessKeyBalance';

const DelegableActionZodSchema = z.union([
  CreateAccountActionZodSchema,
  TransferActionZodSchema,
  AddAccessKeyActionZodSchema,
  DeployContractActionZodSchema,
  FunctionCallActionZodSchema,
  StakeActionZodSchema,
  DeleteKeyActionZodSchema,
  DeleteAccountActionZodSchema,
  RegisterPinnableGlobalContractActionZodSchema,
  RegisterLinkableGlobalContractActionZodSchema,
  LinkGlobalContractActionZodSchema,
  PinGlobalContractActionZodSchema,
  TopUpAccessKeyBalanceActionZodSchema,
  WithdrawAccessKeyBalanceActionZodSchema,
]);

export type InnerDelegableAction = z.infer<typeof DelegableActionZodSchema>;

const NonceChannelReplayProtectionZodSchema = z.object({
  scheme: z.literal('NonceChannel'),
  nonce: TransactionNonceZodSchema,
  nonceChannelId: z.optional(z.never()),
});

const NonceChannelsReplayProtectionZodSchema = z.object({
  scheme: z.literal('NonceChannels'),
  nonceChannelId: NonceChannelIdZodSchema,
  nonce: TransactionNonceZodSchema,
});

const DelegationBaseZodSchema = z.object({
  delegator: z.object({
    accountId: AccountIdZodSchema,
    publicKey: PublicKeyZodSchema,
    replayProtection: z.union([
      NonceChannelReplayProtectionZodSchema,
      NonceChannelsReplayProtectionZodSchema,
    ]),
  }),
  receiverAccountId: AccountIdZodSchema,
  expiration: z.object({
    blockHeight: BlockHeightZodSchema,
  }),
});

const SingleDelegatedActionZodSchema = z.object({
  delegatedAction: DelegableActionZodSchema,
  delegatedActions: z.optional(z.never()),
});

const MultiDelegatedActionsZodSchema = z.object({
  delegatedAction: z.optional(z.never()),
  delegatedActions: z.array(DelegableActionZodSchema).check(z.minLength(1)),
});

export const DelegationZodSchema = z.union([
  z.object({
    ...DelegationBaseZodSchema.shape,
    ...SingleDelegatedActionZodSchema.shape,
  }),
  z.object({
    ...DelegationBaseZodSchema.shape,
    ...MultiDelegatedActionsZodSchema.shape,
  }),
]);

export type InnerDelegation = z.infer<typeof DelegationZodSchema>;

// A signed delegation always carries the action list, never the single-action
// shorthand - `signDelegation` normalizes it before signing. The tag tells its format apart:
// NEP-611 is the one `signDelegation` signs, NEP-366 comes from other signers and has no
// nonce channel id.
export const SignedDelegationZodSchema = z.object({
  delegation: z.union([
    z.object({
      tag: z.literal(constants.Delegation.Nep611Tag),
      ...DelegationBaseZodSchema.shape,
      ...MultiDelegatedActionsZodSchema.shape,
    }),
    z.object({
      tag: z.literal(constants.Delegation.Nep366Tag),
      ...DelegationBaseZodSchema.shape,
      delegator: z.object({
        ...DelegationBaseZodSchema.shape.delegator.shape,
        replayProtection: NonceChannelReplayProtectionZodSchema,
      }),
      ...MultiDelegatedActionsZodSchema.shape,
    }),
  ]),
  signature: SignatureZodSchema,
});

export type InnerSignedDelegation = z.infer<typeof SignedDelegationZodSchema>;
