import type {
  PrivateKey,
  PublicKey,
  Signature,
} from '../crypto';
import type { Hex, Result } from '../common';
import type { NatError } from '../../../src/_common/natError';
import type {
  InvalidSchemaContext,
  InternalErrorContext,
} from '../../natError';
import type { Curve } from '../curveString';

export type KeyPairErrorVariant =
  | {
      kind: 'CreateKeyPair.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateKeyPair.Internal';
      context: InternalErrorContext;
    }
  | {
      kind: 'KeyPair.Sign.Internal';
      context: InternalErrorContext;
    };

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

export type CreateKeyPair = (privateKey: PrivateKey) => KeyPair;

export type SafeCreateKeyPair = (
  privateKey: PrivateKey,
) => Result<KeyPair, CreateKeyPairError>;
