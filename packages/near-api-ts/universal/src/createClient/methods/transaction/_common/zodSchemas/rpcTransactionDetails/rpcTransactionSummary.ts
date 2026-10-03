import { ActionViewSchema, NonceModeSchema } from '@near-js/jsonrpc-types';
import * as z from 'zod/mini';
import { AccountIdZodSchema } from '../../../../../../_common/zodSchemas/accountId';
import { CryptoHashZodSchema } from '../../../../../../_common/zodSchemas/cryptoHash';
import { PublicKeyZodSchema } from '../../../../../../_common/zodSchemas/publicKey';
import { SignatureZodSchema } from '../../../../../../_common/zodSchemas/signature';
import { TransactionNonceZodSchema } from '../../../../../../_common/zodSchemas/transactionNonce';

export const RpcTransactionSummaryZodSchema = z.object({
  actions: z.array(ActionViewSchema()),
  hash: CryptoHashZodSchema,
  nonce: TransactionNonceZodSchema,
  // Both are absent (or null) for a transaction nearcore treats with its defaults: no nonce
  // channel id for a key with a single channel, `monotonic` for the nonce mode.
  nonceIndex: z.optional(z.nullable(z.number().check(z.int(), z.nonnegative()))),
  nonceMode: z.optional(z.nullable(NonceModeSchema())),
  publicKey: PublicKeyZodSchema,
  receiverId: AccountIdZodSchema,
  signature: SignatureZodSchema,
  signerId: AccountIdZodSchema,
});

export type RpcTransactionSummary = z.infer<typeof RpcTransactionSummaryZodSchema>;
