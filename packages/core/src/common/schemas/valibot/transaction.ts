import * as v from 'valibot';
import { PublicKeySchema } from './publicKey';
import { Base58CryptoHashSchema } from './cryptoHash';

// export type Transaction = {
//   signerAccountId: AccountId;
//   signerPublicKey: PublicKey;
//   action?: any;
//   actions?: any[]; // TODO Fix
//   receiverAccountId: AccountId;
//   nonce: AccessKeyNonce;
//   blockHash: BlockHash;
// };



const AccountIdSchema = v.pipe(v.string());
const NonceSchema = v.number('uint64');

export const TransactionSchema = v.object({
  signerAccountId: AccountIdSchema,
  signerPublicKey: PublicKeySchema,
  receiverAccountId: AccountIdSchema,
  nonce: NonceSchema,
  blockHash: Base58CryptoHashSchema,
});
