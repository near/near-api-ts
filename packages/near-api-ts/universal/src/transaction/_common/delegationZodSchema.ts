import * as z from 'zod/mini';
import { constants } from '../../_common/_common/_common/constants';
import { AccountIdZodSchema } from '../../_common/zodSchemas/accountId';
import { BlockHeightZodSchema } from '../../_common/zodSchemas/blockHeight';
import { NonceZodSchema } from '../../_common/zodSchemas/nonce';
import { PublicKeyZodSchema } from '../../_common/zodSchemas/publicKey';
import { SignatureZodSchema } from '../../_common/zodSchemas/signature';
import { AddAccessKeyActionZodSchema } from './_common/zodSchemas/addAccessKey';
import { CallContractFunctionActionZodSchema } from './_common/zodSchemas/callContractFunction';
import { CreateSubAccountActionZodSchema } from './_common/zodSchemas/createSubAccount';
import { DeleteAccessKeyActionZodSchema } from './_common/zodSchemas/deleteAccessKey';
import { DeleteAccountActionZodSchema } from './_common/zodSchemas/deleteAccount';
import { DeployLocalContractActionZodSchema } from './_common/zodSchemas/deployLocalContract';
import { LinkGlobalContractActionZodSchema } from './_common/zodSchemas/linkGlobalContract';
import { PinGlobalContractActionZodSchema } from './_common/zodSchemas/pinGlobalContract';
import { PublishLinkableGlobalContractActionZodSchema } from './_common/zodSchemas/publishLinkableGlobalContract';
import { PublishPinnableGlobalContractActionZodSchema } from './_common/zodSchemas/publishPinnableGlobalContract';
import { StakeActionZodSchema } from './_common/zodSchemas/stake';
import { TopUpAccessKeyBalanceActionZodSchema } from './_common/zodSchemas/topUpAccessKeyBalance';
import { TransferActionZodSchema } from './_common/zodSchemas/transfer';

const DelegableActionZodSchema = z.union([
  CreateSubAccountActionZodSchema,
  TransferActionZodSchema,
  AddAccessKeyActionZodSchema,
  DeployLocalContractActionZodSchema,
  CallContractFunctionActionZodSchema,
  StakeActionZodSchema,
  DeleteAccessKeyActionZodSchema,
  DeleteAccountActionZodSchema,
  PublishPinnableGlobalContractActionZodSchema,
  PublishLinkableGlobalContractActionZodSchema,
  LinkGlobalContractActionZodSchema,
  PinGlobalContractActionZodSchema,
  TopUpAccessKeyBalanceActionZodSchema,
]);

export type InnerDelegableAction = z.infer<typeof DelegableActionZodSchema>;

const DelegationBaseZodSchema = z.object({
  delegator: z.object({
    accountId: AccountIdZodSchema,
    publicKey: PublicKeyZodSchema,
    replayProtection: z.object({
      nonce: NonceZodSchema,
    }),
  }),
  receiverAccountId: AccountIdZodSchema,
  expiration: z.object({
    blockHeight: BlockHeightZodSchema,
  }),
});

export const SingleDelegatedActionZodSchema = z.object({
  delegatedAction: DelegableActionZodSchema,
  delegatedActions: z.optional(z.never()),
});

export const MultiDelegatedActionsZodSchema = z.object({
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
// shorthand - `signDelegation` normalizes it before signing.
export const SignedDelegationZodSchema = z.object({
  delegation: z.object({
    tag: z.literal(constants.Delegation.Nep366Tag),
    ...DelegationBaseZodSchema.shape,
    ...MultiDelegatedActionsZodSchema.shape,
  }),
  signature: SignatureZodSchema,
});

export type InnerSignedDelegation = z.infer<typeof SignedDelegationZodSchema>;
