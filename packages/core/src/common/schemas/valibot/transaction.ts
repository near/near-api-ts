import * as v from 'valibot';

// export type Transaction = {
//   signerAccountId: AccountId;
//   signerPublicKey: PublicKey;
//   action?: any;
//   actions?: any[]; // TODO Fix
//   receiverAccountId: AccountId;
//   nonce: AccessKeyNonce;
//   blockHash: BlockHash;
// };

export const TransactionSchema = v.pipe(
  v.object({
    signerAccountId: v.string(),
  })
)
