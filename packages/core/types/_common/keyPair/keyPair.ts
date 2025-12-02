import type {
  PrivateKey,
  PublicKey,
  Signature,
  U8Signature,
} from 'nat-types/_common/crypto';
import type { Hex, Result } from 'nat-types/_common/common';
import type { NatError } from '@common/natError';
import type {
  InvalidArgsContext,
  UnknownErrorContext,
} from 'nat-types/natError';

export type KeyPairErrorVariant =
  | {
      kind: 'CreateKeyPair.InvalidArgs';
      context: InvalidArgsContext;
    }
  | {
      kind: 'CreateKeyPair.Unknown';
      context: UnknownErrorContext;
    }
  | {
      kind: 'KeyPair.Sign.Unknown';
      context: UnknownErrorContext;
    };

export type SignOutput = { signature: Signature } & U8Signature;
type SignError = NatError<'KeyPair.Sign.Unknown'>;

export type Sign = (message: Hex) => SignOutput;
export type SafeSign = (message: Hex) => Result<SignOutput, SignError>;

type CreateKeyPairError =
  | NatError<'CreateKeyPair.InvalidArgs'>
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
