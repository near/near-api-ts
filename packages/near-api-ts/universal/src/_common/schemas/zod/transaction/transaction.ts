import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../common/accountId';
import { BlockHashZodSchema, TransactionNonceZodSchema } from '../common/common';
import { PublicKeyZodSchema } from '../common/publicKey';
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
  blockHash: BlockHashZodSchema,
});

export const TransactionSingleActionZodSchema = z.object({
  action: ActionZodSchema,
  actions: z.optional(z.never()),
});

export const SingleActionTransactionZodSchema = z.object({
  ...TransactionBaseZodSchema.shape,
  ...TransactionSingleActionZodSchema.shape,
});

export const TransactionMultiActionsZodSchema = z.object({
  action: z.optional(z.never()),
  actions: z.array(ActionZodSchema).check(z.minLength(1)),
});

export const MultiActionsTransactionZodSchema = z.object({
  ...TransactionBaseZodSchema.shape,
  ...TransactionMultiActionsZodSchema.shape,
});

export const TransactionZodSchema = z.union([
  SingleActionTransactionZodSchema,
  MultiActionsTransactionZodSchema,
]);

export type InnerTransaction = z.infer<typeof TransactionZodSchema>;

export const SingleActionTransactionIntentZodSchema = z.object({
  ...TransactionSingleActionZodSchema.shape,
  receiverAccountId: AccountIdZodSchema,
});

export const MultiActionsTransactionIntentZodSchema = z.object({
  ...TransactionMultiActionsZodSchema.shape,
  receiverAccountId: AccountIdZodSchema,
});

export const TransactionIntentZodSchema = z.union([
  SingleActionTransactionIntentZodSchema,
  MultiActionsTransactionIntentZodSchema,
]);
