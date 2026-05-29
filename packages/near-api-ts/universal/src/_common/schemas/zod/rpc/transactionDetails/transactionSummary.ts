import { ActionViewSchema } from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../common/accountId';
import { TransactionNonceZodSchema } from '../../common/common';
import { CryptoHashZodSchema } from '../../common/cryptoHash';
import { PublicKeyZodSchema } from '../../common/publicKey';
import { SignatureZodSchema } from '../../common/signature';

export const RpcTransactionSummaryZodSchema = z.object({
  actions: z.array(ActionViewSchema()),
  hash: CryptoHashZodSchema,
  nonce: TransactionNonceZodSchema,
  publicKey: PublicKeyZodSchema,
  receiverId: AccountIdZodSchema,
  signature: SignatureZodSchema,
  signerId: AccountIdZodSchema,
});

export type RpcTransactionSummary = z.infer<typeof RpcTransactionSummaryZodSchema>;
