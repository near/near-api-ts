import type { NatError } from '../../../src/_common/natError';
import type { Result } from '../common';
import type { Ed25519PrivateKey, Ed25519PublicKey, Ed25519Signature } from '../crypto';
import type { Ed25519Curve } from '../curveString';
import type { KeyPairSignDataArgs } from './_common';

// *********** SignData *****
export type Ed25519SignedData = {
  dataU8: Uint8Array;
  curve: Ed25519Curve;
  signature: Ed25519Signature;
  signatureU8: Uint8Array;
};

type Ed25519SignDataError =
  | NatError<'Ed25519KeyPair.SignData.Args.InvalidSchema'>
  | NatError<'Ed25519KeyPair.SignData.Internal'>;

export type SafeSignData = (
  args: KeyPairSignDataArgs,
) => Promise<Result<Ed25519SignedData, Ed25519SignDataError>>;

type SignData = (args: KeyPairSignDataArgs) => Promise<Ed25519SignedData>;

// ***********  CreateRandomEd25519KeyPair *****

type CreateRandomEd25519KeyPairError = NatError<'CreateRandomEd25519KeyPair.Internal'>;

export type Ed25519KeyPair = {
  curve: 'ed25519';
  publicKey: Ed25519PublicKey;
  publicKeyU8: Uint8Array;
  privateKey: Ed25519PrivateKey;
  privateKeyU8: Uint8Array;
  signData: SignData;
  safeSignData: SafeSignData;
};

export type SafeCreateRandomEd25519KeyPair = () => Result<
  Ed25519KeyPair,
  CreateRandomEd25519KeyPairError
>;

export type CreateRandomEd25519KeyPair = () => Ed25519KeyPair;
