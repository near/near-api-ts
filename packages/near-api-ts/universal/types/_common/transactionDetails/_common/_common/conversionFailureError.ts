import type { AccountId, TransactionNonce } from '../../../common';
import type { NearToken } from '../../../nearToken';

interface GeneralConversionErrorRegistry {}

interface ConversionFailureRegistry extends GeneralConversionErrorRegistry {
  'Signer.NotFound': { signerAccountId: AccountId };
  'Signer.NotEnoughBalance': { transactionCost: NearToken; signerAccountId: AccountId };
  'Nonce.Invalid': { transactionNonce: TransactionNonce; accessKeyNonce: TransactionNonce };
  'Signature.Invalid': null;
  Expired: null;
}

export type ConversionFailureKind = keyof ConversionFailureRegistry;

export type ConversionFailureError<K extends ConversionFailureKind = ConversionFailureKind> =
  K extends K ? { kind: K; context: ConversionFailureRegistry[K] } : never;
