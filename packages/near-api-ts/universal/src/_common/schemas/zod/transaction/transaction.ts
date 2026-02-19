import * as z from 'zod/mini';
import { AccountIdSchema } from '../common/accountId';
import { BlockHashSchema, NonceSchema } from '../common/common';
import { CryptoHashSchema } from '../common/cryptoHash';
import { PublicKeySchema } from '../common/publicKey';
import { SignatureSchema } from '../common/signature';
import { AddKeyActionSchema } from './actions/addKey';
import { CreateAccountActionSchema } from './actions/createAccount';
import { DeleteAccountActionSchema } from './actions/deleteAccount';
import { DeleteKeyActionSchema } from './actions/deleteKey';
import { DeployContractActionSchema } from './actions/deployContract';
import { FunctionCallActionSchema } from './actions/functionCall';
import { StakeActionSchema } from './actions/stake';
import { TransferActionSchema } from './actions/transfer';

const ActionSchema = z.union([
  CreateAccountActionSchema,
  TransferActionSchema,
  AddKeyActionSchema,
  DeployContractActionSchema,
  FunctionCallActionSchema,
  StakeActionSchema,
  DeleteKeyActionSchema,
  DeleteAccountActionSchema,
]);

export type InnerAction = z.infer<typeof ActionSchema>;

const TransactionBaseSchema = z.object({
  signerAccountId: AccountIdSchema,
  signerPublicKey: PublicKeySchema,
  receiverAccountId: AccountIdSchema,
  nonce: NonceSchema,
  blockHash: BlockHashSchema,
});

export const SingleActionTransactionSchema = z.object({
  ...TransactionBaseSchema.shape,
  action: ActionSchema,
  actions: z.optional(z.never()),
});

export const MultiActionsTransactionSchema = z.object({
  ...TransactionBaseSchema.shape,
  action: z.optional(z.never()),
  actions: z.array(ActionSchema).check(z.minLength(1)),
});

export const TransactionSchema = z.union([
  SingleActionTransactionSchema,
  MultiActionsTransactionSchema,
]);

export type InnerTransaction = z.infer<typeof TransactionSchema>;

export const SingleActionTransactionIntentSchema = z.object({
  action: ActionSchema,
  actions: z.optional(z.never()),
  receiverAccountId: AccountIdSchema,
});

export const MultiActionsTransactionIntentSchema = z.object({
  action: z.optional(z.never()),
  actions: z.array(ActionSchema).check(z.minLength(1)),
  receiverAccountId: AccountIdSchema,
});

export const TransactionIntentSchema = z.union([
  SingleActionTransactionIntentSchema,
  MultiActionsTransactionIntentSchema,
]);

export const SignedTransactionSchema = z.object({
  transaction: TransactionSchema,
  transactionHash: CryptoHashSchema,
  signature: SignatureSchema,
});

export type InnerSignedTransaction = z.infer<typeof SignedTransactionSchema>;
