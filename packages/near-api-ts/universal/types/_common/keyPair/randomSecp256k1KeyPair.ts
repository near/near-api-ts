import type { InternalErrorContext } from '../../natError';
import type {
  Secp256k1PrivateKey,
  Secp256k1PublicKey,
  Secp256k1Signature,
} from '../crypto';
import type { NatError } from '../../../src/_common/natError';
import type { Hex, Result } from '../common';
import type { Secp256k1Curve } from '../curveString';

export type RandomSecp256k1KeyPairErrorVariant = {
  kind: 'Secp256k1KeyPair.Sign.Internal';
  context: InternalErrorContext;
};

// *********** Sign *****

export type SignBySecp256k1KeyOutput = {
  signature: Secp256k1Signature;
  curve: Secp256k1Curve;
  u8Signature: Uint8Array;
};

type SignBySecp256k1KeyError = NatError<'Secp256k1KeyPair.Sign.Internal'>;

export type SignBySecp256k1Key = (message: Hex) => SignBySecp256k1KeyOutput;

export type SafeSignBySecp256k1Key = (
  message: Hex,
) => Result<SignBySecp256k1KeyOutput, SignBySecp256k1KeyError>;

// ***********  CreateRandomSecp256k1KeyPair *****

export type CreateRandomSecp256k1KeyPairErrorVariant = {
  kind: 'CreateRandomSecp256k1KeyPair.Internal';
  context: InternalErrorContext;
};

type CreateRandomSecp256k1Error =
  NatError<'CreateRandomSecp256k1KeyPair.Internal'>;

export type Secp256k1KeyPair = {
  publicKey: Secp256k1PublicKey;
  privateKey: Secp256k1PrivateKey;
  sign: SignBySecp256k1Key;
  safeSign: SafeSignBySecp256k1Key;
};

export type SafeCreateRandomSecp256k1KeyPair = () => Result<
  Secp256k1KeyPair,
  CreateRandomSecp256k1Error
>;

export type CreateRandomSecp256k1KeyPair = () => Secp256k1KeyPair;
