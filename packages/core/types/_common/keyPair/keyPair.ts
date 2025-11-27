import type {
  PrivateKey,
  PublicKey,
  Signature,
  U8Signature,
} from 'nat-types/_common/crypto';
import type {Hex, Result} from 'nat-types/_common/common';
import type {NatError} from '@common/natError';
import type {Curve} from 'nat-types/_common/curveString';
import type {$ZodError} from 'zod/v4/core';
import type {UnknownErrorContext} from 'nat-types/natError';

export type KeyPairErrorVariant = {
  kind: 'KeyPair.Sign.Unknown';
  context: UnknownErrorContext;
};

export type SignOutput = { signature: Signature } & U8Signature;
type SignError = NatError<'KeyPair.Sign.Unknown'>;

export type Sign = (message: Hex) => SignOutput;
export type SafeSign = (message: Hex) => Result<SignOutput, SignError>;

export type CreateKeyPairErrorVariant =
  | {
      kind: 'CreateKeyPair.PrivateKey.InvalidCurveString';
      context: {
        zodError: $ZodError;
      };
    }
  | {
      kind: 'CreateKeyPair.PrivateKey.InvalidBinaryLength';
      context: {
        curve: Curve;
        actualLength: number;
        expectedLength: number;
      };
    }
  | {
      kind: 'CreateKeyPair.Unknown';
      context: UnknownErrorContext;
    };

type CreateKeyPairError =
  | NatError<'CreateKeyPair.PrivateKey.InvalidCurveString'>
  | NatError<'CreateKeyPair.PrivateKey.InvalidBinaryLength'>
  | NatError<'CreateKeyPair.Unknown'>;

export type KeyPair = {
  publicKey: PublicKey;
  privateKey: PrivateKey;
  sign: Sign;
  safe: {
    sign: SafeSign;
  };
};

export type CreateKeyPair = (privateKey: PrivateKey) => KeyPair;

export type SafeCreateKeyPair = (
  privateKey: PrivateKey,
) => Result<KeyPair, CreateKeyPairError>;


