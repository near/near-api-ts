import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../../_common/zodSchemas/accountId';
import { CryptoHashZodSchema } from '../../../_common/zodSchemas/cryptoHash';
import { PublicKeyZodSchema } from '../../../_common/zodSchemas/publicKey';
import { TransactionNonceZodSchema } from '../../../_common/zodSchemas/transactionNonce';
import { AddKeyActionZodSchema } from './actions/addKey';
import { CreateAccountActionZodSchema } from './actions/createAccount';
import { DeleteAccountActionZodSchema } from './actions/deleteAccount';
import { DeleteKeyActionZodSchema } from './actions/deleteKey';
import { DeployContractActionZodSchema } from './actions/deployContract';
import { FunctionCallActionZodSchema } from './actions/functionCall';
import { StakeActionZodSchema } from './actions/stake';
import { TransferActionZodSchema } from './actions/transfer';

const ActionZodSchema = z.union([
  CreateAccountActionZodSchema,
  TransferActionZodSchema,
  AddKeyActionZodSchema,
  DeployContractActionZodSchema,
  FunctionCallActionZodSchema,
  StakeActionZodSchema,
  DeleteKeyActionZodSchema,
  DeleteAccountActionZodSchema,
]);

export type InnerAction = z.infer<typeof ActionZodSchema>;

const TransactionBaseZodSchema = z.object({
  signerAccountId: AccountIdZodSchema,
  signerPublicKey: PublicKeyZodSchema,
  receiverAccountId: AccountIdZodSchema,
  nonce: TransactionNonceZodSchema,
  blockHash: CryptoHashZodSchema,
});

const SingleActionZodSchema = z.object({
  action: ActionZodSchema,
  actions: z.optional(z.never()),
});

const MultiActionsZodSchema = z.object({
  action: z.optional(z.never()),
  actions: z.array(ActionZodSchema).check(z.minLength(1)),
});

export const TransactionZodSchema = z.union([
  z.object({
    ...TransactionBaseZodSchema.shape,
    ...SingleActionZodSchema.shape,
  }),
  z.object({
    ...TransactionBaseZodSchema.shape,
    ...MultiActionsZodSchema.shape,
  }),
]);

export type InnerTransaction = z.infer<typeof TransactionZodSchema>;

export const TransactionIntentZodSchema = z.union([
  z.object({
    receiverAccountId: AccountIdZodSchema,
    ...SingleActionZodSchema.shape,
  }),
  z.object({
    receiverAccountId: AccountIdZodSchema,
    ...MultiActionsZodSchema.shape,
  }),
]);
