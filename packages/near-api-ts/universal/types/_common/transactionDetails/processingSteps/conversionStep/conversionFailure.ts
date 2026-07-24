import type { AccountId, TransactionNonce } from '../../../common';
import type { NearToken } from '../../../nearToken';

interface GeneralConversionErrorRegistry {}

export interface ConversionFailureRegistry extends GeneralConversionErrorRegistry {
  'Signer.NotFound': { signerAccountId: AccountId };
  'Signer.NotEnoughBalance': { transactionCost: NearToken; signerAccountId: AccountId };
  InvalidNonce: { transactionNonce: TransactionNonce; accessKeyNonce: TransactionNonce };
  InvalidSignature: null;
  Expired: null;
  Timeout: null;
}

export type ConversionFailureKind = keyof ConversionFailureRegistry;

export type ConversionFailure<K extends ConversionFailureKind = ConversionFailureKind> = K extends K
  ? { kind: K; context: ConversionFailureRegistry[K] }
  : never;
