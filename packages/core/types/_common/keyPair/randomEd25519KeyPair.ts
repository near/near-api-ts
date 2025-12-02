import type { UnknownErrorContext } from 'nat-types/natError';
import type {
  Ed25519PrivateKey,
  Ed25519PublicKey,
  Ed25519Signature,
} from 'nat-types/_common/crypto';
import type { NatError } from '@common/natError';
import type { Hex, Result } from 'nat-types/_common/common';
import type { Ed25519Curve } from 'nat-types/_common/curveString';

export type RandomEd25519KeyPairErrorVariant = {
  kind: 'Ed25519KeyPair.Sign.Unknown';
  context: UnknownErrorContext;
};

// *********** Sign *****

export type SignByEd25519KeyOutput = {
  signature: Ed25519Signature;
  curve: Ed25519Curve;
  u8Signature: Uint8Array;
};

type SignByEd25519KeyError = NatError<'Ed25519KeyPair.Sign.Unknown'>;

export type SignByEd25519Key = (message: Hex) => SignByEd25519KeyOutput;

export type SafeSignByEd25519Key = (
  message: Hex,
) => Result<SignByEd25519KeyOutput, SignByEd25519KeyError>;

// ***********  CreateRandomEd25519KeyPair *****

export type CreateRandomEd25519KeyPairErrorVariant = {
  kind: 'CreateRandomEd25519KeyPair.Unknown';
  context: UnknownErrorContext;
};

type CreateRandomEd25519KeyPairError =
  NatError<'CreateRandomEd25519KeyPair.Unknown'>;

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
