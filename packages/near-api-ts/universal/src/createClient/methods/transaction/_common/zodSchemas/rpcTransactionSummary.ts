import { ActionViewSchema } from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../../../../_common/zodSchemas/accountId';
import { CryptoHashZodSchema } from '../../../../../_common/zodSchemas/cryptoHash';
import { PublicKeyZodSchema } from '../../../../../_common/zodSchemas/publicKey';
import { SignatureZodSchema } from '../../../../../_common/zodSchemas/signature';
import { TransactionNonceZodSchema } from '../../../../../_common/zodSchemas/transactionNonce';

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
