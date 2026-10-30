import type { SafeGetRecentBlockHash } from '../client/cache/getRecentBlockHash';
import type { SafeGetAccessKeys } from '../client/methods/account/getAccessKeys';
import type { SafeSendSignedTransaction } from '../client/methods/transaction/sendSignedTransaction/sendSignedTransaction';

/**
 * What a signer needs from a client: the access keys of its account, a recent block hash for
 * each transaction, and sending a signed transaction. A client from `createClient` fits, and so
 * does any object with these methods. Unlike a vault or a sign service, the methods keep the
 * error types of `Client` - the signer reads them, e.g. to retry on an invalid nonce.
 */
export type SignerClient = {
  safeGetAccessKeys: SafeGetAccessKeys;
  safeGetRecentBlockHash: SafeGetRecentBlockHash;
  safeSendSignedTransaction: SafeSendSignedTransaction;
};
