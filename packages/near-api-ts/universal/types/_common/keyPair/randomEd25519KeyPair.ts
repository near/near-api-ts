import type {
  Ed25519PrivateKey,
  Ed25519PublicKey,
  Ed25519Signature,
} from '../crypto';
import type { NatError } from '../../../src/_common/natError';
import type { Hex, Result } from '../common';
import type { Ed25519Curve } from '../curveString';

// *********** Sign *****

export type SignByEd25519KeyOutput = {
  signature: Ed25519Signature;
  curve: Ed25519Curve;
  u8Signature: Uint8Array;
};

type SignByEd25519KeyError = NatError<'Ed25519KeyPair.Sign.Internal'>;

export type SignByEd25519Key = (message: Hex) => SignByEd25519KeyOutput;

export type SafeSignByEd25519Key = (
  message: Hex,
) => Result<SignByEd25519KeyOutput, SignByEd25519KeyError>;

// ***********  CreateRandomEd25519KeyPair *****

type CreateRandomEd25519KeyPairError =
  NatError<'CreateRandomEd25519KeyPair.Internal'>;

export type Ed25519KeyPair = {
  publicKey: Ed25519PublicKey;
  privateKey: Ed25519PrivateKey;
  sign: SignByEd25519Key;
  safeSign: SafeSignByEd25519Key;
};

export type SafeCreateRandomEd25519KeyPair = () => Result<
  Ed25519KeyPair,
  CreateRandomEd25519KeyPairError
>;

export type CreateRandomEd25519KeyPair = () => Ed25519KeyPair;
