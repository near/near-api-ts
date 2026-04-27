import type { Result } from './common';
import type { PublicKey, Signature } from './crypto';
import type { Curve } from './curveString';

export type SignDataArgs = {
  publicKey: PublicKey;
  dataU8: Uint8Array;
};

export type SignedData = {
  curve: Curve;
  dataU8: Uint8Array;
  signature: Signature;
  signatureU8: Uint8Array;
};

export type SafeSignData<TSignDataError> = (
  args: SignDataArgs,
) => Promise<Result<SignedData, TSignDataError>>;
