import type { PrivateKey, PublicKey, Signature } from '../crypto';
import type { Hex, Result } from '../common';
import type { NatError } from '../../../src/_common/natError';
import type {
  InvalidSchemaErrorContext,
  InternalErrorContext,
} from '../../natError';
import type { Curve } from '../curveString';

export interface KeyPairPublicErrorRegistry {
  'CreateKeyPair.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateKeyPair.Internal': InternalErrorContext;
  'KeyPair.Sign.Internal': InternalErrorContext;
  'CreateRandomEd25519KeyPair.Internal': InternalErrorContext;
  'Ed25519KeyPair.Sign.Internal': InternalErrorContext;
  'CreateRandomSecp256k1KeyPair.Internal': InternalErrorContext;
  'Secp256k1KeyPair.Sign.Internal': InternalErrorContext;
}

export type SignOutput = {
  signature: Signature;
  curve: Curve;
  u8Signature: Uint8Array;
};

type SignError = NatError<'KeyPair.Sign.Internal'>;

export type Sign = (message: Hex) => SignOutput;
export type SafeSign = (message: Hex) => Result<SignOutput, SignError>;

type CreateKeyPairError =
  | NatError<'CreateKeyPair.Args.InvalidSchema'>
  | NatError<'CreateKeyPair.Internal'>;

export type KeyPair = {
  publicKey: PublicKey;
  privateKey: PrivateKey;
  sign: Sign;
  safeSign: SafeSign;
};

export type CreateKeyPair = (privateKey: string) => KeyPair;

export type SafeCreateKeyPair = (
  privateKey: string,
) => Result<KeyPair, CreateKeyPairError>;
