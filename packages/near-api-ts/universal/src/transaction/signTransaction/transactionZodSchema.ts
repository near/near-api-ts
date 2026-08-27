import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../_common/zodSchemas/accountId';
import { CryptoHashZodSchema } from '../../_common/zodSchemas/cryptoHash';
import { PublicKeyZodSchema } from '../../_common/zodSchemas/publicKey';
import { TransactionNonceZodSchema } from '../../_common/zodSchemas/transactionNonce';
import { AddKeyActionZodSchema } from '../_common/_common/zodSchemas/addKey';
import { CreateAccountActionZodSchema } from '../_common/_common/zodSchemas/createAccount';
import { DeleteAccountActionZodSchema } from '../_common/_common/zodSchemas/deleteAccount';
import { DeleteKeyActionZodSchema } from '../_common/_common/zodSchemas/deleteKey';
import { DeployContractActionZodSchema } from '../_common/_common/zodSchemas/deployContract';
import { FunctionCallActionZodSchema } from '../_common/_common/zodSchemas/functionCall';
import { LinkGlobalContractActionZodSchema } from '../_common/_common/zodSchemas/linkGlobalContract';
import { PinGlobalContractActionZodSchema } from '../_common/_common/zodSchemas/pinGlobalContract';
import { RegisterGlobalContractActionZodSchema } from '../_common/_common/zodSchemas/registerGlobalContract';
import { StakeActionZodSchema } from '../_common/_common/zodSchemas/stake';
import { TransferActionZodSchema } from '../_common/_common/zodSchemas/transfer';
import { SignedDelegationZodSchema } from '../_common/delegationZodSchema';

const ExecuteDelegationActionZodSchema = z.object({
  actionType: z.literal('ExecuteDelegation'),
  signedDelegation: SignedDelegationZodSchema,
});

export type InnerExecuteDelegationAction = z.infer<typeof ExecuteDelegationActionZodSchema>;

const TransactionActionZodSchema = z.union([
  CreateAccountActionZodSchema,
  TransferActionZodSchema,
  AddKeyActionZodSchema,
  DeployContractActionZodSchema,
  FunctionCallActionZodSchema,
  StakeActionZodSchema,
  DeleteKeyActionZodSchema,
  DeleteAccountActionZodSchema,
  ExecuteDelegationActionZodSchema,
  RegisterGlobalContractActionZodSchema,
  LinkGlobalContractActionZodSchema,
  PinGlobalContractActionZodSchema,
]);

export type InnerTransactionAction = z.infer<typeof TransactionActionZodSchema>;

const TransactionBaseZodSchema = z.object({
  signerAccountId: AccountIdZodSchema,
  signerPublicKey: PublicKeyZodSchema,
  receiverAccountId: AccountIdZodSchema,
  nonce: TransactionNonceZodSchema,
  blockHash: CryptoHashZodSchema,
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
