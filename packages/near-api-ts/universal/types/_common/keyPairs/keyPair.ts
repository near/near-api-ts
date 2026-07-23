import type { NatError } from '../../../src/_common/natError';
import type { Result } from '../common';
import type { PrivateKey, PublicKey } from '../crypto';
import type { Curve } from '../curveString';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../natError';
import type { SignedData } from '../signData';
import type { KeyPairSignDataArgs } from './_common';

export interface KeyPairPublicErrorRegistry {
  'CreateKeyPair.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateKeyPair.Internal': InternalErrorContext;
  'KeyPair.SignData.Args.InvalidSchema': InvalidSchemaErrorContext;
  'KeyPair.SignData.Internal': InternalErrorContext;

  'CreateRandomEd25519KeyPair.Internal': InternalErrorContext;
  'Ed25519KeyPair.SignData.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Ed25519KeyPair.SignData.Internal': InternalErrorContext;

  'CreateRandomSecp256k1KeyPair.Internal': InternalErrorContext;
  'Secp256k1KeyPair.SignData.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Secp256k1KeyPair.SignData.Internal': InternalErrorContext;

  'CreateRandomMlDsa65KeyPair.Internal': InternalErrorContext;
  'MlDsa65KeyPair.SignData.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MlDsa65KeyPair.SignData.Internal': InternalErrorContext;
}

// *********** SignData *****

type SignDataError =
  | NatError<'KeyPair.SignData.Args.InvalidSchema'>
  | NatError<'KeyPair.SignData.Internal'>;

export type SafeSignData = (
  args: KeyPairSignDataArgs,
) => Promise<Result<SignedData, SignDataError>>;
export type SignData = (args: KeyPairSignDataArgs) => Promise<SignedData>;

// *********** CreateKeyPair *****

type CreateKeyPairError =
  | NatError<'CreateKeyPair.Args.InvalidSchema'>
  | NatError<'CreateKeyPair.Internal'>;

export type KeyPair = {
  curve: Curve;
  publicKey: PublicKey;
  publicKeyU8: Uint8Array;
  privateKey: PrivateKey;
  privateKeyU8: Uint8Array;
  signData: SignData;
  safeSignData: SafeSignData;
};

export type SafeCreateKeyPair = (privateKey: string) => Result<KeyPair, CreateKeyPairError>;
export type CreateKeyPair = (privateKey: string) => KeyPair;
