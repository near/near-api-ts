import * as z from 'zod/mini';
import { constants } from '../../_common/_common/_common/constants';
import { AccountIdZodSchema } from '../../_common/zodSchemas/accountId';
import { BlockHeightZodSchema } from '../../_common/zodSchemas/blockHeight';
import { PublicKeyZodSchema } from '../../_common/zodSchemas/publicKey';
import { SignatureZodSchema } from '../../_common/zodSchemas/signature';
import { TransactionNonceZodSchema } from '../../_common/zodSchemas/transactionNonce';
import { AddKeyActionZodSchema } from './_common/zodSchemas/addKey';
import { CreateAccountActionZodSchema } from './_common/zodSchemas/createAccount';
import { DeleteAccountActionZodSchema } from './_common/zodSchemas/deleteAccount';
import { DeleteKeyActionZodSchema } from './_common/zodSchemas/deleteKey';
import { DeployContractActionZodSchema } from './_common/zodSchemas/deployContract';
import { FunctionCallActionZodSchema } from './_common/zodSchemas/functionCall';
import { RegisterGlobalContractActionZodSchema } from './_common/zodSchemas/registerGlobalContract';
import { StakeActionZodSchema } from './_common/zodSchemas/stake';
import { TransferActionZodSchema } from './_common/zodSchemas/transfer';
import { UseGlobalContractActionZodSchema } from './_common/zodSchemas/useGlobalContract';

const DelegableActionZodSchema = z.union([
  CreateAccountActionZodSchema,
  TransferActionZodSchema,
  AddKeyActionZodSchema,
  DeployContractActionZodSchema,
  FunctionCallActionZodSchema,
  StakeActionZodSchema,
  DeleteKeyActionZodSchema,
  DeleteAccountActionZodSchema,
  RegisterGlobalContractActionZodSchema,
  UseGlobalContractActionZodSchema,
]);

export type InnerDelegableAction = z.infer<typeof DelegableActionZodSchema>;

const DelegationBaseZodSchema = z.object({
  delegatorAccountId: AccountIdZodSchema,
  delegatorPublicKey: PublicKeyZodSchema,
  receiverAccountId: AccountIdZodSchema,
  nonce: TransactionNonceZodSchema,
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
// shorthand - `signDelegation` normalizes it before signing.
export const SignedDelegationZodSchema = z.object({
  delegation: z.object({
    tag: z.literal(constants.Nep366MetaTransaction.Tag),
    ...DelegationBaseZodSchema.shape,
    ...MultiDelegatedActionsZodSchema.shape,
  }),
  signature: SignatureZodSchema,
});
