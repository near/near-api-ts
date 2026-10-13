import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../_common/zodSchemas/accountId';
import { CryptoHashZodSchema } from '../../_common/zodSchemas/cryptoHash';
import { PublicKeyZodSchema } from '../../_common/zodSchemas/publicKey';
import { TransactionNonceZodSchema } from '../../_common/zodSchemas/transactionNonce';
import { AddAccessKeyActionZodSchema } from '../_common/_common/zodSchemas/addAccessKey';
import { CreateAccountActionZodSchema } from '../_common/_common/zodSchemas/createAccount';
import { DeleteAccessKeyActionZodSchema } from '../_common/_common/zodSchemas/deleteAccessKey';
import { DeleteAccountActionZodSchema } from '../_common/_common/zodSchemas/deleteAccount';
import { DeployLocalContractActionZodSchema } from '../_common/_common/zodSchemas/deployLocalContract';
import { FunctionCallActionZodSchema } from '../_common/_common/zodSchemas/functionCall';
import { LinkGlobalContractActionZodSchema } from '../_common/_common/zodSchemas/linkGlobalContract';
import { NonceChannelIdZodSchema } from '../_common/_common/zodSchemas/nonceChannelId';
import { PinGlobalContractActionZodSchema } from '../_common/_common/zodSchemas/pinGlobalContract';
import { PublishLinkableGlobalContractActionZodSchema } from '../_common/_common/zodSchemas/publishLinkableGlobalContract';
import { PublishPinnableGlobalContractActionZodSchema } from '../_common/_common/zodSchemas/publishPinnableGlobalContract';
import { StakeActionZodSchema } from '../_common/_common/zodSchemas/stake';
import { TopUpAccessKeyBalanceActionZodSchema } from '../_common/_common/zodSchemas/topUpAccessKeyBalance';
import { TransferActionZodSchema } from '../_common/_common/zodSchemas/transfer';
import { WithdrawAccessKeyBalanceActionZodSchema } from '../_common/_common/zodSchemas/withdrawAccessKeyBalance';
import { SignedDelegationZodSchema } from '../_common/delegationZodSchema';

const ExecuteDelegationActionZodSchema = z.object({
  actionType: z.literal('ExecuteDelegation'),
  signedDelegation: SignedDelegationZodSchema,
});

export type InnerExecuteDelegationAction = z.infer<typeof ExecuteDelegationActionZodSchema>;

const TransactionActionZodSchema = z.union([
  CreateAccountActionZodSchema,
  TransferActionZodSchema,
  AddAccessKeyActionZodSchema,
  DeployLocalContractActionZodSchema,
  FunctionCallActionZodSchema,
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
    nonce: TransactionNonceZodSchema,
    nonceProgression: NonceProgressionZodSchema,
    nonceChannelId: z.optional(z.never()),
  }),
  z.object({
    scheme: z.literal('NonceChannels'),
    nonceChannelId: NonceChannelIdZodSchema,
    nonce: TransactionNonceZodSchema,
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
