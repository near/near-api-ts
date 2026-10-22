import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../../_common/zodSchemas/accountId';
import { CryptoHashZodSchema } from '../../../_common/zodSchemas/cryptoHash';
import { NonceZodSchema } from '../../../_common/zodSchemas/nonce';
import { PublicKeyZodSchema } from '../../../_common/zodSchemas/publicKey';
import { AddAccessKeyActionZodSchema } from '../../_common/_common/zodSchemas/addAccessKey';
import { CallContractFunctionActionZodSchema } from '../../_common/_common/zodSchemas/callContractFunction';
import { CreateSubAccountActionZodSchema } from '../../_common/_common/zodSchemas/createSubAccount';
import { DeleteAccessKeyActionZodSchema } from '../../_common/_common/zodSchemas/deleteAccessKey';
import { DeleteAccountActionZodSchema } from '../../_common/_common/zodSchemas/deleteAccount';
import { DeployLocalContractActionZodSchema } from '../../_common/_common/zodSchemas/deployLocalContract';
import { LinkGlobalContractActionZodSchema } from '../../_common/_common/zodSchemas/linkGlobalContract';
import { PinGlobalContractActionZodSchema } from '../../_common/_common/zodSchemas/pinGlobalContract';
import { PublishLinkableGlobalContractActionZodSchema } from '../../_common/_common/zodSchemas/publishLinkableGlobalContract';
import { PublishPinnableGlobalContractActionZodSchema } from '../../_common/_common/zodSchemas/publishPinnableGlobalContract';
import { StakeActionZodSchema } from '../../_common/_common/zodSchemas/stake';
import { TopUpAccessKeyBalanceActionZodSchema } from '../../_common/_common/zodSchemas/topUpAccessKeyBalance';
import { TransferActionZodSchema } from '../../_common/_common/zodSchemas/transfer';
import { SignedDelegationZodSchema } from '../../_common/delegationZodSchema';
import { NonceChannelIdZodSchema } from './nonceChannelId';
import { WithdrawAccessKeyBalanceActionZodSchema } from './withdrawAccessKeyBalance';

const ExecuteDelegationActionZodSchema = z.object({
  actionType: z.literal('ExecuteDelegation'),
  signedDelegation: SignedDelegationZodSchema,
});

export type InnerExecuteDelegationAction = z.infer<typeof ExecuteDelegationActionZodSchema>;

const TransactionActionZodSchema = z.union([
  CreateSubAccountActionZodSchema,
  TransferActionZodSchema,
  AddAccessKeyActionZodSchema,
  DeployLocalContractActionZodSchema,
  CallContractFunctionActionZodSchema,
  StakeActionZodSchema,
  DeleteAccessKeyActionZodSchema,
  DeleteAccountActionZodSchema,
  ExecuteDelegationActionZodSchema,
  PublishPinnableGlobalContractActionZodSchema,
  PublishLinkableGlobalContractActionZodSchema,
  LinkGlobalContractActionZodSchema,
  PinGlobalContractActionZodSchema,
  TopUpAccessKeyBalanceActionZodSchema,
  WithdrawAccessKeyBalanceActionZodSchema,
]);

export type InnerTransactionAction = z.infer<typeof TransactionActionZodSchema>;

const NonceProgressionZodSchema = z._default(
  z.union([z.literal('Consecutive'), z.literal('Increasing')]),
  'Consecutive',
);

const TransactionReplayProtectionZodSchema = z.union([
  z.object({
    scheme: z.literal('NonceChannel'),
    nonce: NonceZodSchema,
    nonceProgression: NonceProgressionZodSchema,
    nonceChannelId: z.optional(z.never()),
  }),
  z.object({
    scheme: z.literal('NonceChannels'),
    nonceChannelId: NonceChannelIdZodSchema,
    nonce: NonceZodSchema,
    nonceProgression: NonceProgressionZodSchema,
  }),
]);

export type InnerTransactionReplayProtection = z.infer<typeof TransactionReplayProtectionZodSchema>;

const TransactionBaseZodSchema = z.object({
  signer: z.object({
    accountId: AccountIdZodSchema,
    publicKey: PublicKeyZodSchema,
    replayProtection: TransactionReplayProtectionZodSchema,
  }),
  receiverAccountId: AccountIdZodSchema,
  recentBlockHash: CryptoHashZodSchema,
});

export const SingleTransactionActionZodSchema = z.object({
  action: TransactionActionZodSchema,
  actions: z.optional(z.never()),
});

export const MultiTransactionActionsZodSchema = z.object({
  action: z.optional(z.never()),
  actions: z.array(TransactionActionZodSchema).check(z.minLength(1)),
});

export const TransactionZodSchema = z.union([
  z.object({
    ...TransactionBaseZodSchema.shape,
    ...SingleTransactionActionZodSchema.shape,
  }),
  z.object({
    ...TransactionBaseZodSchema.shape,
    ...MultiTransactionActionsZodSchema.shape,
  }),
]);

export type InnerTransaction = z.infer<typeof TransactionZodSchema>;
