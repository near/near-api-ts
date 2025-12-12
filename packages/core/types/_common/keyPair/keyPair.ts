import type {
  PrivateKey,
  PublicKey,
  Signature,
} from 'nat-types/_common/crypto';
import type { Hex, Result } from 'nat-types/_common/common';
import type { NatError } from '@common/natError';
import type {
  InvalidSchemaContext,
  UnknownErrorContext,
} from 'nat-types/natError';
import type { Curve } from 'nat-types/_common/curveString';

export type KeyPairErrorVariant =
  | {
      kind: 'CreateKeyPair.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateKeyPair.Unknown';
      context: UnknownErrorContext;
    }
  | {
      kind: 'KeyPair.Sign.Unknown';
      context: UnknownErrorContext;
    };

export type SignOutput = {
  signature: Signature;
  curve: Curve;
  u8Signature: Uint8Array;
};

type SignError = NatError<'KeyPair.Sign.Unknown'>;

export type Sign = (message: Hex) => SignOutput;
export type SafeSign = (message: Hex) => Result<SignOutput, SignError>;

type CreateKeyPairError =
  | NatError<'CreateKeyPair.Args.InvalidSchema'>
  | NatError<'CreateKeyPair.Unknown'>;

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
