import * as z from 'zod/mini';
import { constants } from '../../../../../_common/_common/_common/constants';
import { AccountIdZodSchema } from '../../../../../_common/zodSchemas/accountId';
import { BlockHeightZodSchema } from '../../../../../_common/zodSchemas/blockHeight';
import { PublicKeyZodSchema } from '../../../../../_common/zodSchemas/publicKey';
import { SignatureZodSchema } from '../../../../../_common/zodSchemas/signature';
import { TransactionNonceZodSchema } from '../../../../../_common/zodSchemas/transactionNonce';
import { AddKeyActionZodSchema } from '../_common/delegableActions/addKey';
import { CreateAccountActionZodSchema } from '../_common/delegableActions/createAccount';
import { DeleteAccountActionZodSchema } from '../_common/delegableActions/deleteAccount';
import { DeleteKeyActionZodSchema } from '../_common/delegableActions/deleteKey';
import { DeployContractActionZodSchema } from '../_common/delegableActions/deployContract';
import { FunctionCallActionZodSchema } from '../_common/delegableActions/functionCall';
import { StakeActionZodSchema } from '../_common/delegableActions/stake';
import { TransferActionZodSchema } from '../_common/delegableActions/transfer';

const DelegatedActionZodSchema = z.union([
  CreateAccountActionZodSchema,
  TransferActionZodSchema,
  AddKeyActionZodSchema,
  DeployContractActionZodSchema,
  FunctionCallActionZodSchema,
  StakeActionZodSchema,
  DeleteKeyActionZodSchema,
  DeleteAccountActionZodSchema,
]);

export type InnerDelegatedAction = z.infer<typeof DelegatedActionZodSchema>;

export const DelegationBaseZodSchema = z.object({
  signerAccountId: AccountIdZodSchema,
  signerPublicKey: PublicKeyZodSchema,
  receiverAccountId: AccountIdZodSchema,
  nonce: TransactionNonceZodSchema,
  expireAt: z.object({
    blockHeight: BlockHeightZodSchema,
  }),
});

export const SingleDelegatedActionZodSchema = z.object({
  delegatedAction: DelegatedActionZodSchema,
  delegatedActions: z.optional(z.never()),
});

export const MultiDelegatedActionsZodSchema = z.object({
  delegatedAction: z.optional(z.never()),
  delegatedActions: z.array(DelegatedActionZodSchema).check(z.minLength(1)),
});

export const SignedDelegationZodSchema = z.object({
  delegation: z.object({
    tag: z.literal(constants.Nep413Message.Tag),
    ...DelegationBaseZodSchema.shape,
    ...MultiDelegatedActionsZodSchema.shape,
  }),
  signature: SignatureZodSchema,
});
