import * as z from 'zod/mini';
import { AccountIdSchema } from '@common/schemas/zod/common/accountId';
import { PublicKeySchema } from '@common/schemas/zod/common/publicKey';
import {
  BlockHashSchema,
  NonceSchema,
} from '@common/schemas/zod/common/common';
import { CreateAccountActionSchema } from '@common/schemas/zod/transaction/actions/createAccount';
import { AddKeyActionSchema } from '@common/schemas/zod/transaction/actions/addKey';

const ActionSchema = z.union([CreateAccountActionSchema, AddKeyActionSchema]);

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
});

export const MultiActionsTransactionSchema = z.object({
  ...TransactionBaseSchema.shape,
  actions: z.array(ActionSchema).check(z.minLength(1)),
});

export const TransactionSchema = z.union([
  SingleActionTransactionSchema,
  MultiActionsTransactionSchema,
]);
